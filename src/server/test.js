import { EventEmitter } from 'node:events';
import Cookies from 'universal-cookie';
import { WebSocket } from 'ws';


const testCases = [];  // test cases/results
let current = null;  // current test


function testCase(description, callback) {
  current = { description, results: [] };
  callback();
  testCases.push(current);
  current = null;
}


class TestClient extends EventEmitter {
  constructor(url, protocols) {
    super();
    this.url = url;
    this.protocols = protocols;
    this.socket = null;
    this.tests = [];
    this.connect();
  }

  send(type, data) {
    this.socket.send(JSON.stringify({ type, data }));
  }

  close() {
    this.socket.close();
  }

  expect(type, callback) {
    if (current) {
      const caseId = testCases.length;  // test case index
      const resultId = current.results.length;  // test index
      this.tests.push({ caseId, resultId, type, callback })
      current.results.push('');
    }
    else {
      throw new Error('expect() must be called within a testCase() callback.');
    }
  }

  connect() {
    this.socket = new WebSocket(this.url, this.protocols);

    this.socket.addEventListener('close', (e) => {
      setTimeout(() => this.connect(), 2500);
    });

    this.socket.addEventListener('error', (e) => {
      this.socket.close();
    });

    this.socket.addEventListener('message', (e) => {
      const { type, data } = JSON.parse(e.data);

      // test message
      const test = this.tests.pop();
      if (test) {
        let result;
        if (test.type !== type) {
          result = `FAIL --- expected '${test.type}', got '${type}'`;
        }
        else if (!test.callback(data)) {
          result = `FAIL --- callback returned false on '${type}' message'`;
        }
        else {
          result = `PASS --- callback returned true on '${type}' message`;
        }
        testCases[test.caseId].results[test.resultId] = result;

        // print test results once complete
        if (testCases.every((c) => c.results.every(r => r))) {
          testCases.forEach((c, i) => {
            console.log(`TEST CASE ${i}: ${c.description}`);
            c.results.forEach((r, j) => {
              const digits = Math.floor(Math.log10(c.results.length)) + 1;
              
              console.log(String(j).padEnd(digits), r);
            });
          });
          console.log('END TEST ===========================================');
        }
      }
      else {
        console.error(`ERROR: No test found for '${type}' message.`);
      }
    });
  }
}

console.log('BEGIN TEST =========================================');

const client1 = new TestClient('ws://localhost:8080/ws');
const client2 = new TestClient('ws://localhost:8080/ws');

const cookies = new Cookies();

// client1.once('cookies', (data) => {
//   console.log(data);
// });

testCase('shot miss', () => {
  client1.expect('cookies', (data) => {
    return data.user !== undefined;
  })

  client1.expect('cookies', (data) => {
    return data.user !== undefined;
  })
});
