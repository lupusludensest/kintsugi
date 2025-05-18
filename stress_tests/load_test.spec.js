// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Configuration for stress test
const STRESS_TEST_CONFIG = {
  // 1. Users quantity (concurrent requests)
  concurrentUsers: [20, 50, 100], // Change to array for progressive testing

  // 2. Time span (milliseconds between waves)
  timeBetweenWaves: 2000,
  
  // 3. URL - target endpoint
  targetUrl: 'https://kintsugi.su/',
  
  // 4. Number of waves to run
  waves: 3,
  
  // Thresholds for acceptable performance
  thresholds: {
    maxAvgResponseTime: 4000, // Increase from 1500ms to 4000ms for high load testing
    maxErrorRate: 0.05 // 5%
  }
};

test.describe('Load Testing', () => {
  // Add this line to prevent parallel execution with other tests
  test.describe.configure({ mode: 'serial' });

  // Add try/finally to ensure reports are generated
  test('advanced load test with multiple waves', async ({ request }) => {
    // Prepare results directory
    const resultsDir = path.join(__dirname, 'results');
    await mkdirAsync(resultsDir, { recursive: true });
    
    // Test metrics collection
    const metrics = {
      startTime: Date.now(),
      endTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      waves: []
    };

    try {
      // Loop through each concurrency level
      for (const userCount of STRESS_TEST_CONFIG.concurrentUsers) {
        console.log(`\nTesting with ${userCount} concurrent users`);
        
        // Run multiple waves of requests for this concurrency level
        for (let wave = 1; wave <= STRESS_TEST_CONFIG.waves; wave++) {
          console.log(`Starting wave ${wave} of ${STRESS_TEST_CONFIG.waves} with ${userCount} concurrent users`);
          
          const waveStartTime = Date.now();
          const waveResults = [];
          
          try {
            // Run concurrent requests
            await Promise.all(Array(userCount).fill().map(async (_, i) => {
              const requestStartTime = Date.now();
              
              try {
                const response = await request.get(STRESS_TEST_CONFIG.targetUrl);
                const responseTime = Date.now() - requestStartTime;
                
                waveResults.push({
                  id: `${userCount}users-wave${wave}-user${i}`,
                  status: response.status(),
                  success: response.ok(),
                  responseTime: responseTime,
                  timestamp: new Date().toISOString()
                });
                
                metrics.responseTimes.push(responseTime);
                metrics.totalRequests++;
                
                if (response.ok()) {
                  metrics.successfulRequests++;
                } else {
                  metrics.failedRequests++;
                }
              } catch (error) {
                waveResults.push({
                  id: `${userCount}users-wave${wave}-user${i}`,
                  error: error.message,
                  success: false,
                  responseTime: Date.now() - requestStartTime,
                  timestamp: new Date().toISOString()
                });
                
                metrics.totalRequests++;
                metrics.failedRequests++;
              }
            }));
          } catch (error) {
            console.error(`Error during wave ${wave} with ${userCount} users: ${error.message}`);
          }
          
          const waveTime = Date.now() - waveStartTime;
          console.log(`Wave ${wave} with ${userCount} users completed in ${waveTime}ms`);
          
          // Calculate wave metrics
          const waveSuccessful = waveResults.filter(r => r.success).length;
          const waveErrorRate = (waveResults.length - waveSuccessful) / waveResults.length;
          const waveAvgResponseTime = waveResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / waveResults.length;
          
          metrics.waves.push({
            userCount,
            waveNumber: wave,
            totalRequests: waveResults.length,
            successfulRequests: waveSuccessful,
            failedRequests: waveResults.length - waveSuccessful,
            errorRate: waveErrorRate,
            avgResponseTime: waveAvgResponseTime,
            duration: waveTime
          });
          
          // Wait between waves
          if (wave < STRESS_TEST_CONFIG.waves) {
            console.log(`Waiting ${STRESS_TEST_CONFIG.timeBetweenWaves}ms before next wave...`);
            await new Promise(resolve => setTimeout(resolve, STRESS_TEST_CONFIG.timeBetweenWaves));
          }
        }
      }
    } finally {
      // This block will always execute, even if there are errors
      // Complete metrics
      metrics.endTime = Date.now();
      metrics.totalDuration = metrics.endTime - metrics.startTime;
      metrics.avgResponseTime = metrics.responseTimes.length ? 
        metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length : 0;
      metrics.errorRate = metrics.totalRequests ? metrics.failedRequests / metrics.totalRequests : 0;
      
      // Generate report
      const reportData = {
        timestamp: new Date().toISOString(),
        config: STRESS_TEST_CONFIG,
        summary: {
          totalRequests: metrics.totalRequests,
          successfulRequests: metrics.successfulRequests,
          failedRequests: metrics.failedRequests,
          errorRate: metrics.errorRate,
          totalDuration: metrics.totalDuration,
          avgResponseTime: metrics.avgResponseTime,
          completedSuccessfully: metrics.waves.length === STRESS_TEST_CONFIG.concurrentUsers.length * STRESS_TEST_CONFIG.waves
        },
        waves: metrics.waves,
        responseTimes: {
          min: metrics.responseTimes.length ? Math.min(...metrics.responseTimes) : 0,
          max: metrics.responseTimes.length ? Math.max(...metrics.responseTimes) : 0,
          avg: metrics.avgResponseTime,
          p50: percentile(metrics.responseTimes, 50),
          p90: percentile(metrics.responseTimes, 90),
          p95: percentile(metrics.responseTimes, 95),
          p99: percentile(metrics.responseTimes, 99)
        },
        byUserCount: groupResultsByUserCount(metrics.waves)
      };
      
      // Save report BEFORE assertions
      const date = new Date().toISOString().replace(/:/g, '_');
      const reportPath = path.join(resultsDir, `stress_test_report_${date}.json`);
      const htmlReportPath = path.join(resultsDir, `stress_test_report_${date}.html`);
      
      await writeFileAsync(reportPath, JSON.stringify(reportData, null, 2));
      await writeFileAsync(htmlReportPath, generateHtmlReport(reportData));

      console.log(`\n--- Stress Test Summary ---`);
      console.log(`Total Requests: ${metrics.totalRequests}`);
      console.log(`Successful Requests: ${metrics.successfulRequests}`);
      console.log(`Failed Requests: ${metrics.failedRequests}`);
      console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
      console.log(`Average Response Time: ${metrics.avgResponseTime.toFixed(2)}ms`);
      console.log(`Total Duration: ${metrics.totalDuration}ms`);
      console.log(`Report saved to: ${reportPath}`);
      console.log(`HTML Report saved to: ${htmlReportPath}`);

      // THEN do assertions - if they fail, reports are already created
      expect(metrics.avgResponseTime).toBeLessThan(
        STRESS_TEST_CONFIG.thresholds.maxAvgResponseTime,
        `Average response time (${metrics.avgResponseTime.toFixed(2)}ms) exceeds threshold (${STRESS_TEST_CONFIG.thresholds.maxAvgResponseTime}ms)`
      );
      
      expect(metrics.errorRate).toBeLessThan(
        STRESS_TEST_CONFIG.thresholds.maxErrorRate,
        `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds threshold (${(STRESS_TEST_CONFIG.thresholds.maxErrorRate * 100).toFixed(2)}%)`
      );
    }
  }, { timeout: 300000 }); // Increase to 5 minutes (300,000ms)
});

// Helper function to group results by user count for better analysis
function groupResultsByUserCount(waves) {
  const groupedResults = {};
  
  for (const wave of waves) {
    const userCount = wave.userCount;
    
    if (!groupedResults[userCount]) {
      groupedResults[userCount] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalDuration: 0,
        responseTimes: [],
        avgResponseTime: 0
      };
    }
    
    groupedResults[userCount].totalRequests += wave.totalRequests;
    groupedResults[userCount].successfulRequests += wave.successfulRequests;
    groupedResults[userCount].failedRequests += wave.failedRequests;
    groupedResults[userCount].totalDuration += wave.duration;
    groupedResults[userCount].responseTimes.push(wave.avgResponseTime);
  }
  
  // Calculate averages
  for (const [userCount, data] of Object.entries(groupedResults)) {
    data.avgResponseTime = data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length;
    data.errorRate = data.failedRequests / data.totalRequests;
  }
  
  return groupedResults;
}

// Helper function to calculate percentiles
function percentile(array, p) {
  if (array.length === 0) return 0;
  const sorted = [...array].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p / 100;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

// Generate HTML report
function generateHtmlReport(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stress Test Report - ${new Date(data.timestamp).toLocaleString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1, h2 { color: #0066cc; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { background: #f7f7f7; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
    .metric { border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: white; }
    .metric h3 { margin-top: 0; font-size: 14px; color: #666; }
    .metric p { margin-bottom: 0; font-size: 24px; font-weight: bold; color: #0066cc; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0066cc; color: white; text-align: left; padding: 10px; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) { background: #f2f2f2; }
    .good { color: green; }
    .bad { color: red; }
    .chart-container { height: 300px; margin: 20px 0; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>Stress Test Report</h1>
    <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
    
    <h2>Test Configuration</h2>
    <div class="summary">
      <div class="summary-grid">
        <div class="metric">
          <h3>Concurrent Users</h3>
          <p>${data.config.concurrentUsers}</p>
        </div>
        <div class="metric">
          <h3>Waves</h3>
          <p>${data.config.waves}</p>
        </div>
        <div class="metric">
          <h3>Time Between Waves</h3>
          <p>${data.config.timeBetweenWaves}ms</p>
        </div>
        <div class="metric">
          <h3>Target URL</h3>
          <p>${data.config.targetUrl}</p>
        </div>
      </div>
    </div>
    
    <h2>Summary</h2>
    <div class="summary">
      <div class="summary-grid">
        <div class="metric">
          <h3>Total Requests</h3>
          <p>${data.summary.totalRequests}</p>
        </div>
        <div class="metric">
          <h3>Successful</h3>
          <p class="good">${data.summary.successfulRequests}</p>
        </div>
        <div class="metric">
          <h3>Failed</h3>
          <p class="${data.summary.failedRequests > 0 ? 'bad' : 'good'}">${data.summary.failedRequests}</p>
        </div>
        <div class="metric">
          <h3>Error Rate</h3>
          <p class="${data.summary.errorRate > data.config.thresholds.maxErrorRate ? 'bad' : 'good'}">
            ${(data.summary.errorRate * 100).toFixed(2)}%
          </p>
        </div>
        <div class="metric">
          <h3>Total Duration</h3>
          <p>${data.summary.totalDuration}ms</p>
        </div>
        <div class="metric">
          <h3>Avg Response Time</h3>
          <p class="${data.summary.avgResponseTime > data.config.thresholds.maxAvgResponseTime ? 'bad' : 'good'}">
            ${data.summary.avgResponseTime.toFixed(2)}ms
          </p>
        </div>
      </div>
    </div>
    
    <h2>Response Time Percentiles</h2>
    <div class="summary">
      <div class="summary-grid">
        <div class="metric">
          <h3>Minimum</h3>
          <p>${data.responseTimes.min}ms</p>
        </div>
        <div class="metric">
          <h3>Maximum</h3>
          <p>${data.responseTimes.max}ms</p>
        </div>
        <div class="metric">
          <h3>P50 (Median)</h3>
          <p>${data.responseTimes.p50.toFixed(2)}ms</p>
        </div>
        <div class="metric">
          <h3>P90</h3>
          <p>${data.responseTimes.p90.toFixed(2)}ms</p>
        </div>
        <div class="metric">
          <h3>P95</h3>
          <p>${data.responseTimes.p95.toFixed(2)}ms</p>
        </div>
        <div class="metric">
          <h3>P99</h3>
          <p>${data.responseTimes.p99.toFixed(2)}ms</p>
        </div>
      </div>
    </div>
    
    <h2>Wave Performance</h2>
    <div class="chart-container">
      <canvas id="waveChart"></canvas>
    </div>
    
    <h2>Wave Details</h2>
    <table>
      <thead>
        <tr>
          <th>Wave</th>
          <th>Requests</th>
          <th>Successful</th>
          <th>Failed</th>
          <th>Error Rate</th>
          <th>Avg Response</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${data.waves.map(wave => `
        <tr>
          <td>${wave.waveNumber}</td>
          <td>${wave.totalRequests}</td>
          <td>${wave.successfulRequests}</td>
          <td>${wave.failedRequests}</td>
          <td>${(wave.errorRate * 100).toFixed(2)}%</td>
          <td>${wave.avgResponseTime.toFixed(2)}ms</td>
          <td>${wave.duration}ms</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <script>
    // Create charts
    const ctx = document.getElementById('waveChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(data.waves.map(w => `Wave ${w.waveNumber}`))},
        datasets: [
          {
            label: 'Avg Response Time (ms)',
            data: ${JSON.stringify(data.waves.map(w => w.avgResponseTime))},
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Error Rate (%)',
            data: ${JSON.stringify(data.waves.map(w => w.errorRate * 100))},
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Response Time (ms)'
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Error Rate (%)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}