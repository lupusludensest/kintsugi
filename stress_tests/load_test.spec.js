import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// playwright.stress.config.js
import baseConfig from '../playwright.stress.config';  // <-- This is the problem line

// Get directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Set global timeout
test.setTimeout(600000); // 10 minutes for all tests

// Configuration for stress test
const STRESS_TEST_CONFIG = {
  // User quantities
  concurrentUsers: [20, 25, 30], // Moderate load levels
  
  // Time between waves
  timeBetweenWaves: 2000,
  
  // Multiple endpoints to test
  endpoints: [
    { url: 'https://kintsugi.su/', name: 'Home' },
    { url: 'https://kintsugi.su/about', name: 'About' },
    { url: 'https://kintsugi.su/contacts', name: 'Contacts' },
    { url: 'https://kintsugi.su/legislation', name: 'Legislation' }
  ],
  
  // Number of waves to run
  waves: 3,
  
  // Testing mode: 'sequential' or 'concurrent'
  endpointTestMode: 'sequential',
  
  // Thresholds
  thresholds: {
    maxAvgResponseTime: 4000,
    maxErrorRate: 0.05
  }
};

// Global variables to track test state
let metrics = null;
let allEndpointMetrics = [];
let reportGenerated = false;

// Add emergency report generation
test.afterEach(async () => {
  if (metrics && !reportGenerated) {
    try {
      // Generate emergency report
      const date = new Date().toISOString().replace(/:/g, '_');
      const resultsDir = path.join(__dirname, 'results');
      await mkdirAsync(resultsDir, { recursive: true });
      
      const reportPath = path.join(resultsDir, `emergency_report_${date}.json`);
      const htmlReportPath = path.join(resultsDir, `emergency_report_${date}.html`);
      
      // Complete metrics
      metrics.endTime = Date.now();
      metrics.totalDuration = metrics.endTime - metrics.startTime;
      
      const reportData = {
        timestamp: date,
        config: STRESS_TEST_CONFIG,
        summary: {
          totalRequests: metrics.totalRequests,
          successfulRequests: metrics.successfulRequests,
          failedRequests: metrics.failedRequests,
          errorRate: metrics.totalRequests ? metrics.failedRequests / metrics.totalRequests : 0,
          totalDuration: metrics.totalDuration,
          avgResponseTime: metrics.responseTimes.length ? 
            metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length : 0,
          completedSuccessfully: false,
          interruptedReason: "Test timeout"
        },
        waves: metrics.waves,
        endpointMetrics: allEndpointMetrics
      };
      
      await writeFileAsync(reportPath, JSON.stringify(reportData, null, 2));
      await writeFileAsync(htmlReportPath, generateHtmlReport(reportData));
      
      console.log("\n--- EMERGENCY REPORT GENERATED (test was interrupted) ---");
      console.log(`Report saved to: ${reportPath}`);
      console.log(`HTML Report saved to: ${htmlReportPath}`);
      
      reportGenerated = true;
    } catch (error) {
      console.error(`Failed to generate emergency report: ${error.message}`);
    }
  }
});

test.describe('Load Testing', () => {
  // Configure tests to run serially
  test.describe.configure({ mode: 'serial' });

  test('advanced load test with multiple waves', async ({ request }) => {
    // Initialize metrics
    metrics = {
      startTime: Date.now(),
      endTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      waves: []
    };
    
    allEndpointMetrics = [];
    reportGenerated = false;
    
    const resultsDir = path.join(__dirname, 'results');
    await mkdirAsync(resultsDir, { recursive: true });
    
    try {
      // For sequential endpoint testing
      for (const endpoint of STRESS_TEST_CONFIG.endpoints) {
        console.log(`\n===== Testing endpoint: ${endpoint.name} (${endpoint.url}) =====`);
        
        const endpointMetrics = {
          name: endpoint.name,
          url: endpoint.url,
          startTime: Date.now(),
          endTime: 0,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          responseTimes: [],
          waves: []
        };
        
        // Loop through each concurrency level
        for (const userCount of STRESS_TEST_CONFIG.concurrentUsers) {
          console.log(`\nTesting ${endpoint.name} with ${userCount} concurrent users`);
          
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
                  const response = await request.get(endpoint.url);
                  const responseTime = Date.now() - requestStartTime;
                  
                  waveResults.push({
                    id: `${endpoint.name}-${userCount}users-wave${wave}-user${i}`,
                    status: response.status(),
                    success: response.ok(),
                    responseTime: responseTime,
                    timestamp: new Date().toISOString()
                  });
                  
                  // Update metrics
                  metrics.responseTimes.push(responseTime);
                  metrics.totalRequests++;
                  endpointMetrics.responseTimes.push(responseTime);
                  endpointMetrics.totalRequests++;
                  
                  if (response.ok()) {
                    metrics.successfulRequests++;
                    endpointMetrics.successfulRequests++;
                  } else {
                    metrics.failedRequests++;
                    endpointMetrics.failedRequests++;
                  }
                } catch (error) {
                  waveResults.push({
                    id: `${endpoint.name}-${userCount}users-wave${wave}-user${i}`,
                    error: error.message,
                    success: false,
                    responseTime: Date.now() - requestStartTime,
                    timestamp: new Date().toISOString()
                  });
                  
                  // Update metrics
                  metrics.totalRequests++;
                  metrics.failedRequests++;
                  endpointMetrics.totalRequests++;
                  endpointMetrics.failedRequests++;
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
            
            // Store wave data
            const waveData = {
              endpoint: endpoint.name,
              userCount,
              waveNumber: wave,
              totalRequests: waveResults.length,
              successfulRequests: waveSuccessful,
              failedRequests: waveResults.length - waveSuccessful,
              errorRate: waveErrorRate,
              avgResponseTime: waveAvgResponseTime,
              duration: waveTime
            };
            
            metrics.waves.push(waveData);
            endpointMetrics.waves.push(waveData);
            
            // Wait between waves
            if (wave < STRESS_TEST_CONFIG.waves) {
              console.log(`Waiting ${STRESS_TEST_CONFIG.timeBetweenWaves}ms before next wave...`);
              await new Promise(resolve => setTimeout(resolve, STRESS_TEST_CONFIG.timeBetweenWaves));
            }
          }
        }
        
        // Complete endpoint metrics
        endpointMetrics.endTime = Date.now();
        endpointMetrics.totalDuration = endpointMetrics.endTime - endpointMetrics.startTime;
        endpointMetrics.avgResponseTime = endpointMetrics.responseTimes.length ? 
          endpointMetrics.responseTimes.reduce((a, b) => a + b, 0) / endpointMetrics.responseTimes.length : 0;
        endpointMetrics.errorRate = endpointMetrics.totalRequests ? 
          endpointMetrics.failedRequests / endpointMetrics.totalRequests : 0;
        
        allEndpointMetrics.push(endpointMetrics);
      }
      
      // Complete overall metrics
      metrics.endTime = Date.now();
      metrics.totalDuration = metrics.endTime - metrics.startTime;
      metrics.avgResponseTime = metrics.responseTimes.length ? 
        metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length : 0;
      metrics.errorRate = metrics.totalRequests ? metrics.failedRequests / metrics.totalRequests : 0;
      
      // Generate full report
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
          completedSuccessfully: true
        },
        endpoints: allEndpointMetrics,
        waves: metrics.waves,
        responseTimes: {
          min: metrics.responseTimes.length ? Math.min(...metrics.responseTimes) : 0,
          max: metrics.responseTimes.length ? Math.max(...metrics.responseTimes) : 0,
          avg: metrics.avgResponseTime,
          p50: percentile(metrics.responseTimes, 50),
          p90: percentile(metrics.responseTimes, 90),
          p95: percentile(metrics.responseTimes, 95),
          p99: percentile(metrics.responseTimes, 99)
        }
      };
      
      // Save report
      const date = new Date().toISOString().replace(/:/g, '_');
      const reportPath = path.join(resultsDir, `multi_endpoint_stress_test_${date}.json`);
      const htmlReportPath = path.join(resultsDir, `multi_endpoint_stress_test_${date}.html`);
      
      await writeFileAsync(reportPath, JSON.stringify(reportData, null, 2));
      await writeFileAsync(htmlReportPath, generateHtmlReport(reportData));
      
      reportGenerated = true;
      
      console.log(`\n--- Stress Test Summary ---`);
      console.log(`Total Requests: ${metrics.totalRequests}`);
      console.log(`Successful Requests: ${metrics.successfulRequests}`);
      console.log(`Failed Requests: ${metrics.failedRequests}`);
      console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
      console.log(`Average Response Time: ${metrics.avgResponseTime.toFixed(2)}ms`);
      console.log(`Total Duration: ${metrics.totalDuration}ms`);
      console.log(`Report saved to: ${reportPath}`);
      console.log(`HTML Report saved to: ${htmlReportPath}`);
      
      // Assertions
      expect(metrics.errorRate).toBeLessThan(
        STRESS_TEST_CONFIG.thresholds.maxErrorRate,
        `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds threshold (${(STRESS_TEST_CONFIG.thresholds.maxErrorRate * 100).toFixed(2)}%)`
      );
    } catch (error) {
      console.error(`Test error: ${error.message}`);
      throw error;
    }
  });
});

// Helper function for percentiles
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

// Include the HTML report generation function
function generateHtmlReport(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multi-Endpoint Stress Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3 { color: #0066cc; }
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
    .endpoint-section { margin-bottom: 40px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
    .tab-container { margin: 20px 0; }
    .tab-buttons { display: flex; border-bottom: 1px solid #ddd; }
    .tab-button { padding: 10px 20px; background: #f1f1f1; border: none; cursor: pointer; }
    .tab-button.active { background: #0066cc; color: white; }
    .tab-content { display: none; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .tab-content.active { display: block; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>Multi-Endpoint Stress Test Report</h1>
    <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
    
    <h2>Test Configuration</h2>
    <div class="summary">
      <div class="summary-grid">
        <div class="metric">
          <h3>Concurrent Users</h3>
          <p>${data.config.concurrentUsers.join(', ')}</p>
        </div>
        <div class="metric">
          <h3>Waves per User Level</h3>
          <p>${data.config.waves}</p>
        </div>
        <div class="metric">
          <h3>Time Between Waves</h3>
          <p>${data.config.timeBetweenWaves}ms</p>
        </div>
        <div class="metric">
          <h3>Endpoints Tested</h3>
          <p>${data.config.endpoints.length}</p>
        </div>
      </div>
    </div>
    
    <h2>Overall Summary</h2>
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
          <p>${data.responseTimes?.min || 0}ms</p>
        </div>
        <div class="metric">
          <h3>Maximum</h3>
          <p>${data.responseTimes?.max || 0}ms</p>
        </div>
        <div class="metric">
          <h3>P50 (Median)</h3>
          <p>${data.responseTimes?.p50?.toFixed(2) || 0}ms</p>
        </div>
        <div class="metric">
          <h3>P90</h3>
          <p>${data.responseTimes?.p90?.toFixed(2) || 0}ms</p>
        </div>
        <div class="metric">
          <h3>P95</h3>
          <p>${data.responseTimes?.p95?.toFixed(2) || 0}ms</p>
        </div>
        <div class="metric">
          <h3>P99</h3>
          <p>${data.responseTimes?.p99?.toFixed(2) || 0}ms</p>
        </div>
      </div>
    </div>
    
    <h2>Endpoint Comparison</h2>
    <div class="chart-container">
      <canvas id="endpointComparisonChart"></canvas>
    </div>
    
    <h2>Endpoint Details</h2>
    ${data.endpoints?.map(endpoint => `
      <div class="endpoint-section">
        <h3>${endpoint.name} (${endpoint.url})</h3>
        <div class="summary">
          <div class="summary-grid">
            <div class="metric">
              <h3>Total Requests</h3>
              <p>${endpoint.totalRequests}</p>
            </div>
            <div class="metric">
              <h3>Successful</h3>
              <p class="good">${endpoint.successfulRequests}</p>
            </div>
            <div class="metric">
              <h3>Failed</h3>
              <p class="${endpoint.failedRequests > 0 ? 'bad' : 'good'}">${endpoint.failedRequests}</p>
            </div>
            <div class="metric">
              <h3>Error Rate</h3>
              <p class="${endpoint.errorRate > data.config.thresholds.maxErrorRate ? 'bad' : 'good'}">
                ${(endpoint.errorRate * 100).toFixed(2)}%
              </p>
            </div>
            <div class="metric">
              <h3>Duration</h3>
              <p>${endpoint.totalDuration}ms</p>
            </div>
            <div class="metric">
              <h3>Avg Response</h3>
              <p class="${endpoint.avgResponseTime > data.config.thresholds.maxAvgResponseTime ? 'bad' : 'good'}">
                ${endpoint.avgResponseTime.toFixed(2)}ms
              </p>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <canvas id="endpointChart-${endpoint.name}"></canvas>
        </div>
        
        <h4>Wave Details</h4>
        <table>
          <thead>
            <tr>
              <th>Wave</th>
              <th>Users</th>
              <th>Requests</th>
              <th>Successful</th>
              <th>Failed</th>
              <th>Error Rate</th>
              <th>Avg Response</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${endpoint.waves.map(wave => `
            <tr>
              <td>${wave.waveNumber}</td>
              <td>${wave.userCount}</td>
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
    `).join('') || ''}
    
    <h2>All Wave Details</h2>
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Users</th>
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
        ${data.waves?.map(wave => `
        <tr>
          <td>${wave.endpoint}</td>
          <td>${wave.userCount}</td>
          <td>${wave.waveNumber}</td>
          <td>${wave.totalRequests}</td>
          <td>${wave.successfulRequests}</td>
          <td>${wave.failedRequests}</td>
          <td>${(wave.errorRate * 100).toFixed(2)}%</td>
          <td>${wave.avgResponseTime.toFixed(2)}ms</td>
          <td>${wave.duration}ms</td>
        </tr>
        `).join('') || ''}
      </tbody>
    </table>
  </div>
  
  <script>
    // Create endpoint comparison chart
    const createEndpointComparisonChart = () => {
      const ctx = document.getElementById('endpointComparisonChart').getContext('2d');
      
      const endpoints = ${JSON.stringify(data.endpoints?.map(e => e.name) || [])};
      const responseTimesData = ${JSON.stringify(data.endpoints?.map(e => e.avgResponseTime) || [])};
      const errorRateData = ${JSON.stringify(data.endpoints?.map(e => e.errorRate * 100) || [])};
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: endpoints,
          datasets: [
            {
              label: 'Average Response Time (ms)',
              data: responseTimesData,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1
            },
            {
              label: 'Error Rate (%)',
              data: errorRateData,
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1,
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
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: 'Error Rate (%)'
              }
            }
          }
        }
      });
    };
    
    // Create individual endpoint charts
    ${data.endpoints?.map(endpoint => `
    const createEndpointChart${endpoint.name} = () => {
      const ctx = document.getElementById('endpointChart-${endpoint.name}').getContext('2d');
      
      const userCounts = ${JSON.stringify([...new Set(endpoint.waves.map(w => w.userCount))])};
      const waveNumbers = ${JSON.stringify([...new Set(endpoint.waves.map(w => w.waveNumber))])};
      
      // Group response times by user count and wave
      const responseTimesByUserCount = {};
      ${endpoint.waves.map(wave => `
        if (!responseTimesByUserCount[${wave.userCount}]) {
          responseTimesByUserCount[${wave.userCount}] = [];
        }
        responseTimesByUserCount[${wave.userCount}][${wave.waveNumber - 1}] = ${wave.avgResponseTime};
      `).join('')}
      
      const datasets = userCounts.map(userCount => ({
        label: userCount + ' Users',
        data: responseTimesByUserCount[userCount] || [],
        borderColor: getRandomColor(),
        tension: 0.1,
        fill: false
      }));
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: waveNumbers.map(n => 'Wave ' + n),
          datasets
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
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Response Times by Wave and User Count'
            }
          }
        }
      });
    };
    `).join('\n') || ''}
    
    // Helper function for random colors
    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    
    // Initialize charts when page loads
    window.onload = () => {
      createEndpointComparisonChart();
      ${data.endpoints?.map(endpoint => `createEndpointChart${endpoint.name}();`).join('\n') || ''}
    };
  </script>
</body>
</html>`;
}