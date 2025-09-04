import http from 'k6/http';
//performance testing tool
// export const options = {
//     vus: 1000,
//   iterations: 1000,
//     duration: '5s',
//     thresholds: {
//         http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
//         http_req_failed: ['rate<0.01'], // less than 1% of requests should fail
//     },
// };

// load test
// export const options = {
//   vus: 100, // simulate 100 users
//   duration: '1m', // over 1 minute
// };

// stress test
// export const options = {
//   stages: [
//     { duration: '1m', target: 100 },
//     { duration: '1m', target: 200 },
//     { duration: '1m', target: 500 },
//     { duration: '1m', target: 1000 }, // keep increasing
//   ],
// };

// soak test
// export const options = {
//   vus: 100, // constant number of users
//   duration: '1h', // long-running test
// };

export default function () {
  const url = 'http://localhost:3333/api/auth/login';
  const payload = JSON.stringify({
    username: 'vanteo',
    password: '123456789',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}