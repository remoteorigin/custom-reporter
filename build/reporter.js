'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _humanizeDuration = require('humanize-duration');

var _humanizeDuration2 = _interopRequireDefault(_humanizeDuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DURATION_OPTIONS = {
    units: ['m', 's'],
    round: true,
    spacer: ''
};

var getTimeMeasure = {
    time: 0,
    startTime: 0,
    endTime: 0,
    start: function start() {
        getTimeMeasure.startTime = new Date().getTime();
    },
    end: function end() {
        getTimeMeasure.endTime = new Date().getTime();
    },
    result: function result() {
        getTimeMeasure.time = getTimeMeasure.endTime - getTimeMeasure.startTime;
        if (getTimeMeasure.time < 1000) {
            getTimeMeasure.time = getTimeMeasure.time + ' ms';
        } else {
            getTimeMeasure.time = getTimeMeasure.time / 1000 + ' s';
        }
        return getTimeMeasure.time;
    }

    /**
     * Initialize a new `spec` test reporter.
     *
     * @param {Runner} runner
     * @api public
     */
};
var SpecReporter = function (_events$EventEmitter) {
    _inherits(SpecReporter, _events$EventEmitter);

    function SpecReporter(baseReporter, config) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, SpecReporter);

        var _this = _possibleConstructorReturn(this, (SpecReporter.__proto__ || Object.getPrototypeOf(SpecReporter)).call(this));

        _this.chalk = _chalk2.default;
        _this.baseReporter = baseReporter;
        _this.config = config;
        _this.options = options;
        _this.shortEnglishHumanizer = _humanizeDuration2.default.humanizer({
            language: 'shortEn',
            languages: { shortEn: {
                    h: function h() {
                        return 'h';
                    },
                    m: function m() {
                        return 'm';
                    },
                    s: function s() {
                        return 's';
                    },
                    ms: function ms() {
                        return 'ms';
                    }
                } }
        });

        _this.errorCount = 0;
        _this.indents = {};
        _this.suiteIndents = {};
        _this.specs = {};
        _this.results = {};
        _this.timeMeasure = getTimeMeasure;
        //Object for test cases time

        _this.times = {};

        _this.on('runner:start', function (runner) {
            this.suiteIndents[runner.cid] = {};
            this.indents[runner.cid] = 0;
            this.specs[runner.cid] = runner.specs;
            this.results[runner.cid] = {
                passing: 0,
                pending: 0,
                failing: 0
            };
        });

        _this.on('suite:start', function (suite) {
            this.suiteIndents[suite.cid][suite.uid] = ++this.indents[suite.cid];
        });

        _this.on('test:pending', function (test) {
            this.results[test.cid].pending++;
        });

        _this.on('test:pass', function (test) {
            this.results[test.cid].passing++;
        });

        _this.on('test:start', function (test) {
            console.log('------------------------------------------------------------------\n');
            console.log(_this.chalk.bold(test.title), '\n');
            _this.timeMeasure.start();
        });

        _this.on('test:end', function (test) {
            _this.timeMeasure.end();
            _this.times[test.uid] = _this.timeMeasure.result();
            console.log('\nTest case finished in', _this.chalk.yellow(_this.timeMeasure.result(), '\n'));
        });

        _this.on('test:fail', function (test) {
            this.results[test.cid].failing++;
        });

        _this.on('suite:end', function (suite) {
            this.indents[suite.cid]--;
        });

        _this.on('runner:end', function (runner) {
            this.printSuiteResult(runner);
        });

        _this.on('end', function () {
            this.printSuitesSummary();
        });
        return _this;
    }

    _createClass(SpecReporter, [{
        key: 'indent',
        value: function indent(cid, uid) {
            var indents = this.suiteIndents[cid][uid];
            return indents === 0 ? '' : Array(indents).join('    ');
        }
    }, {
        key: 'getSymbol',
        value: function getSymbol(state) {
            var symbols = this.baseReporter.symbols;

            var symbol = '?'; // in case of an unknown state

            switch (state) {
                case 'pass':
                    symbol = symbols.ok;
                    break;
                case 'pending':
                    symbol = '-';
                    break;
                case 'fail':
                    this.errorCount++;
                    symbol = this.errorCount + ')';
                    break;
            }

            return symbol;
        }
    }, {
        key: 'getColor',
        value: function getColor(state) {
            var color = null; // in case of an unknown state

            switch (state) {
                case 'pass':
                case 'passing':
                    color = 'green';
                    break;
                case 'pending':
                    color = 'cyan';
                    break;
                case 'fail':
                case 'failing':
                    color = 'red';
                    break;
            }

            return color;
        }
    }, {
        key: 'getBrowserCombo',
        value: function getBrowserCombo(caps) {
            var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var device = caps.deviceId;
            var deviceName = caps.deviceName;
            var browser = caps.browserName || caps.browser;
            var version = caps.version || caps.platformVersion || caps.browser_version;
            var platform = caps.os ? caps.os + ' ' + caps.os_version : caps.platform || caps.platformName;

            /**
             * mobile capabilities
             */
            if (device) {
                var program = (caps.app || '').replace('sauce-storage:', '') || caps.browserName;
                var executing = program ? `executing ${program}` : '';

                if (!verbose) {
                    return `${device} ${platform} ${version}`;
                }

                return `${device} on ${platform} ${version} ${executing}`.trim();
            }

            if (!verbose) {
                return (deviceName + ' ').trim();
            }

            return browser + (version ? ` (v${version})` : '') + (platform ? ` on ${platform}` : '');
        }
    }, {
        key: 'getResultList',
        value: function getResultList(cid, suites) {
            var preface = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            var output = '';

            for (var specUid in suites) {
                // Remove "before all" tests from the displayed results
                if (specUid.indexOf('"before all"') === 0) {
                    continue;
                }

                var spec = suites[specUid];
                var indent = this.indent(cid, specUid);
                var specTitle = suites[specUid].title;

                if (specUid.indexOf('"before all"') !== 0) {
                    output += `${preface} ${indent}${specTitle}\n`;
                }

                for (var testUid in spec.tests) {
                    var test = spec.tests[testUid];
                    var testTitle = spec.tests[testUid].title;

                    if (test.state === '') {
                        continue;
                    }

                    output += preface;
                    output += '   ' + indent;
                    output += this.chalk[this.getColor(test.state)](this.getSymbol(test.state));
                    output += ' ' + testTitle;
                    output += ' ' + '(' + this.chalk['yellow'](this.times[testUid]) + ')' + '\n';
                }

                output += preface.trim() + '\n';
            }

            return output;
        }
    }, {
        key: 'getSummary',
        value: function getSummary(states, duration) {
            var preface = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            var output = '';
            var displayedDuration = false;

            for (var state in states) {
                var testCount = states[state];
                var testDuration = '';

                /**
                 * don't display 0 passing/pending of failing test label
                 */
                if (testCount === 0) {
                    continue;
                }

                /**
                 * set duration
                 */
                if (!displayedDuration) {
                    testDuration = ' (' + this.shortEnglishHumanizer(duration, DURATION_OPTIONS) + ')';
                }

                output += preface + ' ';
                output += this.chalk[this.getColor(state)](testCount);
                output += ' ' + this.chalk[this.getColor(state)](state);
                output += testDuration;
                output += '\n';
                displayedDuration = true;
            }

            return output;
        }
    }, {
        key: 'getFailureList',
        value: function getFailureList(failures, preface) {
            var _this2 = this;

            var output = '';

            failures.forEach(function (test, i) {
                var title = typeof test.parent !== 'undefined' ? test.parent + ' ' + test.title : test.title;
                output += `${preface.trim()}\n`;
                output += `${preface} ${i + 1}) ${title}:\n`;
                output += `${preface} ${_this2.chalk.red(test.err.message)}\n`;
                if (test.err.stack) {
                    var stack = test.err.stack.split(/\n/g).map(function (l) {
                        return `${preface} ${_this2.chalk.gray(l)}`;
                    }).join('\n');
                    output += `${stack}\n`;
                } else {
                    output += `${preface} ${_this2.chalk.gray('no stack available')}\n`;
                }
            });

            return output;
        }
    }, {
        key: 'getJobLink',
        value: function getJobLink(results, preface) {
            if (!results.config.host) {
                return '';
            }

            var output = '';
            if (results.config.host.indexOf('saucelabs.com') > -1 || results.config.sauceConnect === true) {
                output += `${preface.trim()}\n`;
                output += `${preface} Check out job at https://saucelabs.com/tests/${results.sessionID}\n`;
                return output;
            }

            return output;
        }
    }, {
        key: 'getSuiteResult',
        value: function getSuiteResult(runner) {
            var cid = runner.cid;
            var stats = this.baseReporter.stats;
            var results = stats.runners[cid];
            var preface = `[${this.getBrowserCombo(results.capabilities, false)} #${cid}]`;
            var specHash = stats.getSpecHash(runner);
            var spec = results.specs[specHash];
            var combo = this.getBrowserCombo(results.capabilities);
            var failures = stats.getFailures().filter(function (f) {
                return f.cid === cid || Object.keys(f.runner).indexOf(cid) > -1;
            });

            /**
             * don't print anything if no specs where executed
             */
            if (Object.keys(spec.suites).length === 0) {
                return '';
            }

            this.errorCount = 0;
            var output = '';

            output += '------------------------------------------------------------------\n';

            /**
             * won't be available when running multiremote tests
             */
            if (results.sessionID) {
                output += `${preface} Session ID: ${results.sessionID}\n`;
            }

            output += `${preface} Spec: ${this.specs[cid]}\n`;

            /**
             * won't be available when running multiremote tests
             */
            if (combo) {
                output += `${preface} Running: ${combo}\n`;
            }

            output += `${preface}\n`;
            output += this.getResultList(cid, spec.suites, preface);
            output += `${preface}\n`;
            output += this.getSummary(this.results[cid], spec._duration, preface);
            output += this.getFailureList(failures, preface);
            output += this.getJobLink(results, preface);
            output += `${preface}\n`;
            return output;
        }
    }, {
        key: 'printSuiteResult',
        value: function printSuiteResult(runner) {
            console.log(this.getSuiteResult(runner));
        }
    }, {
        key: 'getSuitesSummary',
        value: function getSuitesSummary(specCount) {
            var output = '\n\n==================================================================\n';
            output += 'Number of specs: ' + specCount;
            return output;
        }
    }, {
        key: 'printSuitesSummary',
        value: function printSuitesSummary() {
            var specCount = Object.keys(this.baseReporter.stats.runners).length;

            /**
             * no need to print summary if only one runner was executed
             */
            if (specCount === 1) {
                return;
            }

            var epilogue = this.baseReporter.epilogue;
            console.log(this.getSuitesSummary(specCount));
            epilogue.call(this.baseReporter);
        }
    }]);

    return SpecReporter;
}(_events2.default.EventEmitter);

exports.default = SpecReporter;
module.exports = exports['default'];