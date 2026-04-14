# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gmail-core.spec.ts >> Gmail Login - Core Scenarios >> should return appropriate response structure
- Location: e2e/gmail-core.spec.ts:359:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  272 |         page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  273 |           data: {
  274 |             googleId: googleId,
  275 |             email: email,
  276 |             name: `Concurrent User ${i}`,
  277 |             picture: 'https://example.com/photo.jpg',
  278 |           },
  279 |         })
  280 |       );
  281 |     }
  282 | 
  283 |     const responses = await Promise.all(registrations);
  284 | 
  285 |     // All should succeed
  286 |     for (const response of responses) {
  287 |       expect(response.ok()).toBeTruthy();
  288 |       const result = await response.json();
  289 |       expect(result.result.data.success).toBe(true);
  290 |     }
  291 | 
  292 |     // All should have unique user IDs
  293 |     const userIds = new Set();
  294 |     for (const response of responses) {
  295 |       const result = await response.json();
  296 |       userIds.add(result.result.data.userId);
  297 |     }
  298 |     expect(userIds.size).toBe(3);
  299 |   });
  300 | 
  301 |   test('should not create duplicate accounts for same Google ID', async ({ page }) => {
  302 |     const email = `duplicate-${Date.now()}@gmail.com`;
  303 |     const googleId = `google-duplicate-${Date.now()}`;
  304 | 
  305 |     // First registration
  306 |     const firstResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  307 |       data: {
  308 |         googleId: googleId,
  309 |         email: email,
  310 |         name: 'Duplicate Test',
  311 |         picture: 'https://example.com/photo.jpg',
  312 |       },
  313 |     });
  314 | 
  315 |     const firstResult = await firstResponse.json();
  316 |     const firstUserId = firstResult.result.data.userId;
  317 | 
  318 |     // Second registration with same Google ID
  319 |     const secondResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  320 |       data: {
  321 |         googleId: googleId,
  322 |         email: email,
  323 |         name: 'Duplicate Test',
  324 |         picture: 'https://example.com/photo.jpg',
  325 |       },
  326 |     });
  327 | 
  328 |     const secondResult = await secondResponse.json();
  329 |     const secondUserId = secondResult.result.data.userId;
  330 | 
  331 |     // Should return the same user
  332 |     expect(secondUserId).toBe(firstUserId);
  333 |     // Should not be marked as new registration
  334 |     expect(secondResult.result.data.isNewRegistration).toBe(false);
  335 |   });
  336 | 
  337 |   test('should handle Gmail login with special characters in name', async ({ page }) => {
  338 |     const email = `special-${Date.now()}@gmail.com`;
  339 |     const googleId = `google-special-${Date.now()}`;
  340 |     const nameWithSpecialChars = "O'Brien-Smith (José)";
  341 | 
  342 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  343 |       data: {
  344 |         googleId: googleId,
  345 |         email: email,
  346 |         name: nameWithSpecialChars,
  347 |         picture: 'https://example.com/photo.jpg',
  348 |       },
  349 |     });
  350 | 
  351 |     expect(response.ok()).toBeTruthy();
  352 |     const result = await response.json();
  353 |     const userData = result.result.data.user;
  354 | 
  355 |     // Name should be stored correctly
  356 |     expect(userData.name).toBe(nameWithSpecialChars);
  357 |   });
  358 | 
  359 |   test('should return appropriate response structure', async ({ page }) => {
  360 |     const email = `structure-${Date.now()}@gmail.com`;
  361 |     const googleId = `google-structure-${Date.now()}`;
  362 | 
  363 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  364 |       data: {
  365 |         googleId: googleId,
  366 |         email: email,
  367 |         name: 'Structure Test',
  368 |         picture: 'https://example.com/photo.jpg',
  369 |       },
  370 |     });
  371 | 
> 372 |     expect(response.ok()).toBeTruthy();
      |                           ^ Error: expect(received).toBeTruthy()
  373 |     const result = await response.json();
  374 |     const data = result.result.data;
  375 | 
  376 |     // Verify response structure
  377 |     expect(data).toHaveProperty('success');
  378 |     expect(data).toHaveProperty('message');
  379 |     expect(data).toHaveProperty('userId');
  380 |     expect(data).toHaveProperty('redirectUrl');
  381 |     expect(data).toHaveProperty('isNewRegistration');
  382 |     expect(data).toHaveProperty('user');
  383 |     expect(data).toHaveProperty('clientStatus');
  384 |   });
  385 | });
  386 | 
```