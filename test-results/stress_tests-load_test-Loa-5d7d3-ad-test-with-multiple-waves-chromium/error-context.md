# Test info

- Name: Load Testing >> advanced load test with multiple waves
- Location: E:\Gurov_SSD_256\IT\Testing\Automation_08_09_2019\kintsugi\stress_tests\load_test.spec.js:110:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 0.05
Received:   0.42857142857142855
    at E:\Gurov_SSD_256\IT\Testing\Automation_08_09_2019\kintsugi\stress_tests\load_test.spec.js:307:33
```

# Test source

```ts
  207 |               console.error(`Error during wave ${wave} with ${userCount} users: ${error.message}`);
  208 |             }
  209 |             
  210 |             const waveTime = Date.now() - waveStartTime;
  211 |             console.log(`Wave ${wave} with ${userCount} users completed in ${waveTime}ms`);
  212 |             
  213 |             // Calculate wave metrics
  214 |             const waveSuccessful = waveResults.filter(r => r.success).length;
  215 |             const waveErrorRate = (waveResults.length - waveSuccessful) / waveResults.length;
  216 |             const waveAvgResponseTime = waveResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / waveResults.length;
  217 |             
  218 |             // Store wave data
  219 |             const waveData = {
  220 |               endpoint: endpoint.name,
  221 |               userCount,
  222 |               waveNumber: wave,
  223 |               totalRequests: waveResults.length,
  224 |               successfulRequests: waveSuccessful,
  225 |               failedRequests: waveResults.length - waveSuccessful,
  226 |               errorRate: waveErrorRate,
  227 |               avgResponseTime: waveAvgResponseTime,
  228 |               duration: waveTime
  229 |             };
  230 |             
  231 |             metrics.waves.push(waveData);
  232 |             endpointMetrics.waves.push(waveData);
  233 |             
  234 |             // Wait between waves
  235 |             if (wave < STRESS_TEST_CONFIG.waves) {
  236 |               console.log(`Waiting ${STRESS_TEST_CONFIG.timeBetweenWaves}ms before next wave...`);
  237 |               await new Promise(resolve => setTimeout(resolve, STRESS_TEST_CONFIG.timeBetweenWaves));
  238 |             }
  239 |           }
  240 |         }
  241 |         
  242 |         // Complete endpoint metrics
  243 |         endpointMetrics.endTime = Date.now();
  244 |         endpointMetrics.totalDuration = endpointMetrics.endTime - endpointMetrics.startTime;
  245 |         endpointMetrics.avgResponseTime = endpointMetrics.responseTimes.length ? 
  246 |           endpointMetrics.responseTimes.reduce((a, b) => a + b, 0) / endpointMetrics.responseTimes.length : 0;
  247 |         endpointMetrics.errorRate = endpointMetrics.totalRequests ? 
  248 |           endpointMetrics.failedRequests / endpointMetrics.totalRequests : 0;
  249 |         
  250 |         allEndpointMetrics.push(endpointMetrics);
  251 |       }
  252 |       
  253 |       // Complete overall metrics
  254 |       metrics.endTime = Date.now();
  255 |       metrics.totalDuration = metrics.endTime - metrics.startTime;
  256 |       metrics.avgResponseTime = metrics.responseTimes.length ? 
  257 |         metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length : 0;
  258 |       metrics.errorRate = metrics.totalRequests ? metrics.failedRequests / metrics.totalRequests : 0;
  259 |       
  260 |       // Generate full report
  261 |       const reportData = {
  262 |         timestamp: new Date().toISOString(),
  263 |         config: STRESS_TEST_CONFIG,
  264 |         summary: {
  265 |           totalRequests: metrics.totalRequests,
  266 |           successfulRequests: metrics.successfulRequests,
  267 |           failedRequests: metrics.failedRequests,
  268 |           errorRate: metrics.errorRate,
  269 |           totalDuration: metrics.totalDuration,
  270 |           avgResponseTime: metrics.avgResponseTime,
  271 |           completedSuccessfully: true
  272 |         },
  273 |         endpoints: allEndpointMetrics,
  274 |         waves: metrics.waves,
  275 |         responseTimes: {
  276 |           min: metrics.responseTimes.length ? Math.min(...metrics.responseTimes) : 0,
  277 |           max: metrics.responseTimes.length ? Math.max(...metrics.responseTimes) : 0,
  278 |           avg: metrics.avgResponseTime,
  279 |           p50: percentile(metrics.responseTimes, 50),
  280 |           p90: percentile(metrics.responseTimes, 90),
  281 |           p95: percentile(metrics.responseTimes, 95),
  282 |           p99: percentile(metrics.responseTimes, 99)
  283 |         }
  284 |       };
  285 |       
  286 |       // Save report
  287 |       const date = new Date().toISOString().replace(/:/g, '_');
  288 |       const reportPath = path.join(resultsDir, `multi_endpoint_stress_test_${date}.json`);
  289 |       const htmlReportPath = path.join(resultsDir, `multi_endpoint_stress_test_${date}.html`);
  290 |       
  291 |       await writeFileAsync(reportPath, JSON.stringify(reportData, null, 2));
  292 |       await writeFileAsync(htmlReportPath, generateHtmlReport(reportData));
  293 |       
  294 |       reportGenerated = true;
  295 |       
  296 |       console.log(`\n--- Stress Test Summary ---`);
  297 |       console.log(`Total Requests: ${metrics.totalRequests}`);
  298 |       console.log(`Successful Requests: ${metrics.successfulRequests}`);
  299 |       console.log(`Failed Requests: ${metrics.failedRequests}`);
  300 |       console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
  301 |       console.log(`Average Response Time: ${metrics.avgResponseTime.toFixed(2)}ms`);
  302 |       console.log(`Total Duration: ${metrics.totalDuration}ms`);
  303 |       console.log(`Report saved to: ${reportPath}`);
  304 |       console.log(`HTML Report saved to: ${htmlReportPath}`);
  305 |       
  306 |       // Assertions
> 307 |       expect(metrics.errorRate).toBeLessThan(
      |                                 ^ Error: expect(received).toBeLessThan(expected)
  308 |         STRESS_TEST_CONFIG.thresholds.maxErrorRate,
  309 |         `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds threshold (${(STRESS_TEST_CONFIG.thresholds.maxErrorRate * 100).toFixed(2)}%)`
  310 |       );
  311 |     } catch (error) {
  312 |       console.error(`Test error: ${error.message}`);
  313 |       throw error;
  314 |     }
  315 |   });
  316 | });
  317 |
  318 | // Helper function for percentiles
  319 | function percentile(array, p) {
  320 |   if (array.length === 0) return 0;
  321 |   const sorted = [...array].sort((a, b) => a - b);
  322 |   const pos = (sorted.length - 1) * p / 100;
  323 |   const base = Math.floor(pos);
  324 |   const rest = pos - base;
  325 |   if (sorted[base + 1] !== undefined) {
  326 |     return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  327 |   } else {
  328 |     return sorted[base];
  329 |   }
  330 | }
  331 |
  332 | // Include the HTML report generation function
  333 | function generateHtmlReport(data) {
  334 |   return `<!DOCTYPE html>
  335 | <html lang="en">
  336 | <head>
  337 |   <meta charset="UTF-8">
  338 |   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  339 |   <title>Multi-Endpoint Stress Test Report</title>
  340 |   <style>
  341 |     body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
  342 |     h1, h2, h3 { color: #0066cc; }
  343 |     .container { max-width: 1200px; margin: 0 auto; }
  344 |     .summary { background: #f7f7f7; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
  345 |     .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
  346 |     .metric { border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: white; }
  347 |     .metric h3 { margin-top: 0; font-size: 14px; color: #666; }
  348 |     .metric p { margin-bottom: 0; font-size: 24px; font-weight: bold; color: #0066cc; }
  349 |     table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  350 |     th { background: #0066cc; color: white; text-align: left; padding: 10px; }
  351 |     td { padding: 10px; border-bottom: 1px solid #ddd; }
  352 |     tr:nth-child(even) { background: #f2f2f2; }
  353 |     .good { color: green; }
  354 |     .bad { color: red; }
  355 |     .chart-container { height: 300px; margin: 20px 0; }
  356 |     .endpoint-section { margin-bottom: 40px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
  357 |     .tab-container { margin: 20px 0; }
  358 |     .tab-buttons { display: flex; border-bottom: 1px solid #ddd; }
  359 |     .tab-button { padding: 10px 20px; background: #f1f1f1; border: none; cursor: pointer; }
  360 |     .tab-button.active { background: #0066cc; color: white; }
  361 |     .tab-content { display: none; padding: 20px; border: 1px solid #ddd; border-top: none; }
  362 |     .tab-content.active { display: block; }
  363 |   </style>
  364 |   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  365 | </head>
  366 | <body>
  367 |   <div class="container">
  368 |     <h1>Multi-Endpoint Stress Test Report</h1>
  369 |     <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
  370 |     
  371 |     <h2>Test Configuration</h2>
  372 |     <div class="summary">
  373 |       <div class="summary-grid">
  374 |         <div class="metric">
  375 |           <h3>Concurrent Users</h3>
  376 |           <p>${data.config.concurrentUsers.join(', ')}</p>
  377 |         </div>
  378 |         <div class="metric">
  379 |           <h3>Waves per User Level</h3>
  380 |           <p>${data.config.waves}</p>
  381 |         </div>
  382 |         <div class="metric">
  383 |           <h3>Time Between Waves</h3>
  384 |           <p>${data.config.timeBetweenWaves}ms</p>
  385 |         </div>
  386 |         <div class="metric">
  387 |           <h3>Endpoints Tested</h3>
  388 |           <p>${data.config.endpoints.length}</p>
  389 |         </div>
  390 |       </div>
  391 |     </div>
  392 |     
  393 |     <h2>Overall Summary</h2>
  394 |     <div class="summary">
  395 |       <div class="summary-grid">
  396 |         <div class="metric">
  397 |           <h3>Total Requests</h3>
  398 |           <p>${data.summary.totalRequests}</p>
  399 |         </div>
  400 |         <div class="metric">
  401 |           <h3>Successful</h3>
  402 |           <p class="good">${data.summary.successfulRequests}</p>
  403 |         </div>
  404 |         <div class="metric">
  405 |           <h3>Failed</h3>
  406 |           <p class="${data.summary.failedRequests > 0 ? 'bad' : 'good'}">${data.summary.failedRequests}</p>
  407 |         </div>
```