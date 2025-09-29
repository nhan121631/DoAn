import http from 'k6/http';
//performance testing tool
// export const options = {
//  scenarios: {
//   constant_rps: {
//    executor: 'constant-arrival-rate',
//    rate: 100,       // 100 requests per second
//    timeUnit: '1s',
//    duration: '1m',
//    preAllocatedVUs: 50,
//    maxVUs: 200,
//   },
//  },
//  thresholds: {
//   http_req_duration: ['p(95)<1000'], // 95% request < 1s
//   http_req_failed: ['rate<0.01'],  // lỗi < 1%
//  },
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
export const options = {
  vus: 100, // constant number of users
  duration: '1h', // long-running test
};

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