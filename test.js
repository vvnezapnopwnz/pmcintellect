const { spawn } = require('child_process');
const got = require('got');
const test = require('tape');

// Start the app
const env = { ...process.env, PORT: 5000 };
const child = spawn('node', ['index.js'], { env });

test('responds to requests', (t) => {
  t.plan(4);

  // Wait until the server is ready
  child.stdout.on('data', (_) => {
    // Make a request to our app
    (async () => {
      const response = await got('http://127.0.0.1:5000');
      // stop the server
      child.kill();
      // No error
      t.false(response.error);
      // Successful response
      t.equal(response.statusCode, 200);
      // Assert content checks
      t.notEqual(response.body.indexOf('<title>Node.js Getting Started on Heroku</title>'), -1);
      t.notEqual(response.body.indexOf('Getting Started on Heroku with Node.js'), -1);
    })();
  });
});

(7,	Рейтинговый срез),
(7,	Рейтинговый срез),
(7,	Рейтинговый срез),
(7,	Рейтинговый срез),
(7,	Рейтинговый срез),
(7,	Рейтинговый срез),
(10,	Рейтинговый срез),
(10,	Рейтинговый срез),
(12,	Рейтинговый срез),
(11,	Рейтинг),
(11,	Рейтинг),
(23,	Рейтинг),
(23,	Рейтинг),
(8,	Рейтинг),
(8,	Рейтинг),
(24,	Рейтинг),
(24,	Рейтинг),
(15,	Рейтинговый срез),
(15,	Рейтинговый срез),
(17,	Рейтинговый срез),
(18,	Рейтинговый срез),
(18,	Рейтинговый срез),
(19,	Рейтинговый срез),
(19,	Рейтинговый срез),
(20,	Рейтинговый срез),
(20,	Рейтинговый срез),
(21,	Рейтинговый срез),
(21,	Рейтинговый срез),
(22,	Рейтинговый срез),
(22,	Рейтинговый срез),
(15,	Рейтинговый срез),
(16,	Рейтинговый срез),
(17,	Рейтинговый срез),
(33,	Рейтинговый срез),
(18,	Рейтинговый срез),
(19,	Рейтинговый срез),
(21,	Рейтинговый срез),
(22,	Рейтинговый срез),
(26,	Пробное тестирование),
(23	Рейтинг),
(23	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(24,	Рейтинг),
(25,	Рейтинг),
(25,	Рейтинг),
(25,	Рейтинг),
(25,	Рейтинг),
(34,	Рейтинг),
(34,	Рейтинг),
(35,	Рейтинг),
(35,	Рейтинг),
(7,	Рейтинговый срез),
(7,	Рейтинговый срез),
(36,	Рейтинг),
(36,	Рейтинг),
(37,	Рейтинг),
(37,	Рейтинг),
(6,	Рейтинг),
(6,	Рейтинг),
(38,	Рейтинг),
(38,	Рейтинг),
(39,	Рейтинг),
(39,	Рейтинг),
(39,	Рейтинг),
(40,	Рейтинг),
(40,	Рейтинг),
(41,	Рейтинг),
(41,	Рейтинг),
(42,	Рейтинг),
(42,	Рейтинг),
(43,	Рейтинг),
(43,	Рейтинг),
(45,	Рейтинг),
(45,	Рейтинг),
(46,	Рейтинг),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Рейтинговый срез),
(15,	Рейтинговый срез),
(19,	Рейтинговый срез),
(22,	Рейтинговый срез),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(46,	Рейтинг)
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(26,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(12,	Рейтинговый срез),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(33,	Рейтинговый срез),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(17,	Рейтинговый срез),
(62,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(62,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(67,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(67,	Рейтинговый срез),
(29,	Пробное тестирование),
(67,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(67,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(63,	Рейтинговый срез),
(63,	Рейтинговый срез),
(63,	Рейтинговый срез),
(63,	Рейтинговый срез),
(29,	Пробное тестирование),
(61,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(61,	Рейтинговый срез),
(61,	Рейтинговый срез),
(61,	Рейтинговый срез),
(61,	Рейтинговый срез),
(68,	Рейтинговый срез),
(68,	Рейтинговый срез),
(68,	Рейтинговый срез),
(58,	Рейтинговый срез),
(58,	Рейтинговый срез),
(58,	Рейтинговый срез),
(58,	Рейтинговый срез),
(58,	Рейтинговый срез),
(65,	Рейтинговый срез),
(65,	Рейтинговый срез),
(65,	Рейтинговый срез),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(30,	Пробное тестирование),
(29,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(13,	Рейтинговый срез),
(17,	Рейтинговый срез),
(18,	Рейтинговый срез),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Рейтинговый срез),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(62,	Рейтинг по теме Кинематика)
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(65,	Рейтинговый срез),
(65,	Рейтинговый срез),
(64,	Рейтинговый срез),
(64,	Рейтинговый срез),
(64,	Рейтинговый срез),
(64,	Рейтинговый срез),
(64,	Рейтинговый срез),
(61,	Рейтинг по теме Кинематика),
(58,	Пробный экзамен),
(58,	Пробный экзамен),
(62,	Пробный экзамен),
(62,	Пробный экзамен),
(67,	Пробный экзамен),
(67,	Пробный экзамен),
(63,	Пробный экзамен),
(61,	Пробный экзамен),
(61,	Пробный экзамен),
(68,	Пробный экзамен),
(68,	Пробный экзамен),
(59,	Пробный экзамен),
(66,	Пробный экзамен),
(18,	Рейтинговый срез),
(13,	Рейтинговый срез),
(20,	Рейтинговый срез),
(20,	Рейтинговый срез),
(21,	Рейтинговый срез),
(64,	Пробный экзамен),
(65,	Пробный экзамен),
(65,	Пробный экзамен),
(65,	Пробный экзамен),
(65,	Пробный экзамен),
(66,	Рейтинговый срез),
(66,	Рейтинговый срез),
(66,	Рейтинговый срез),
(66,	Рейтинговый срез),
(62,	Рейтинговый срез),
(62,	Рейтинговый срез),
(68,	Рейтинговый срез),
(59,	Рейтинговый срез),
(59,	Рейтинговый срез),
(22,	Рейтинговый срез),
(19,	Рейтинговый срез),
(15,	Рейтинговый срез),
(21,	Рейтинговый срез),
(33,	Рейтинговый срез),
(33,	Рейтинговый срез),
(33,	Рейтинговый срез),
(17,	Рейтинговый срез),
(17,	Рейтинговый срез),
(17,	Рейтинговый срез),
(17,	Рейтинговый срез),
(18,	Рейтинговый срез),
(18,	Рейтинговый срез),
(18,	Рейтинговый срез),
(18,	Рейтинговый срез),
(15,	Рейтинговый срез),
(15,	Рейтинговый срез),
(16,	Рейтинговый срез),
(16,	Рейтинговый срез),
(13,	Рейтинговый срез),
(14,	Рейтинговый срез),
(14,	Рейтинговый срез),
(32,	Пробное тестирование),
(28,	Пробное тестирование),
(31,	Пробное тестирование),
(44,	Пробное тестирование),
(29,	Пробное тестирование),
(30,	Пробное тестирование),
(26,	Пробное тестирование),
(27,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(11,	Рейтинг),
(11,	Рейтинг),
(11,	Рейтинг),
(11,	Рейтинг),
(8,	Рейтинг),
(8,	Рейтинг),
(8,	Рейтинг),
(23,	Рейтинг),
(23,	Рейтинг),
(23,	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(9,	Рейтинг),
(24,	Рейтинг),
(24,	Рейтинг),
(24,	Рейтинг),
(24,	Рейтинг),
(24,	Рейтинг),
(25,	Рейтинг),
(25,	Рейтинг),
(34,	Рейтинг),
(34,	Рейтинг),
(35,	Рейтинг),
(35,	Рейтинг),
(36,	Рейтинг),
(36,	Рейтинг),
(37,	Рейтинг),
(37,	Рейтинг),
(38,	Рейтинг),
(38,	Рейтинг),
(39,	Рейтинг),
(39,	Рейтинг),
(39,	Рейтинг),
(41,	Рейтинг),
(41,	Рейтинг),
(42,	Рейтинг),
(42,	Рейтинг),
(43,	Рейтинг),
(43,	Рейтинг),
(46,	Рейтинг),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(44,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(26,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(27,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(28,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(29,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(30,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(31,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(32,	Пробное тестирование),
(27,	Пробное тестирование),
(26,	Пробное тестирование),
(30,	Пробное тестирование),
(28,	Пробное тестирование),
(32,	Пробное тестирование),
(31,	Пробное тестирование),
(29,	Пробное тестирование),
(28,	Пробное тестирование),
(26,	Пробное тестирование),
(32,	Пробное тестирование),
(31,	Пробное тестирование),
44,	Пробное тестирование),
(29,	Пробное тестирование),
(27,	Пробное тестирование),
(30,	Пробное тестирование),
(11,	Рейтинг),
(8,	Рейтинг),
(24,	Рейтинг),
(25,	Рейтинг),
(34,	Рейтинг),
(35,	Рейтинг),
(36,	Рейтинг),
(6,	Рейтинг),
(38,	Рейтинг),
(39,	Рейтинг),
(41,	Рейтинг),
(42,	Рейтинг),
(43,	Рейтинг),
(45,	Рейтинг),
(51,	Рейтинг),
(57,	Рейтинг),
(50,	Рейтинг),
(23,	Рейтинг),
(40,	Рейтинг),
(55,	Рейтинг),
(56,	Рейтинг),
(52,	Рейтинг),
(33,	Рейтинговый срез),
(33,	Рейтинговый срез)

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	