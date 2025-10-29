'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _junitReportBuilder = require('junit-report-builder');

var _junitReportBuilder2 = _interopRequireDefault(_junitReportBuilder);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Initialize a new `Junit` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */
var JunitReporter = function (_events$EventEmitter) {
    _inherits(JunitReporter, _events$EventEmitter);

    function JunitReporter(baseReporter, config) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, JunitReporter);

        var _this = _possibleConstructorReturn(this, (JunitReporter.__proto__ || Object.getPrototypeOf(JunitReporter)).call(this));

        _this.baseReporter = baseReporter;
        _this.config = config;
        _this.options = options;
        _this.suiteNameRegEx = _this.options.suiteNameFormat instanceof RegExp ? _this.options.suiteNameFormat : /[^a-zA-Z0-9]+/;

        _this.on('end', _this.onEnd.bind(_this));
        return _this;
    }

    _createClass(JunitReporter, [{
        key: 'onEnd',
        value: function onEnd() {
            var outputIsFunction = typeof this.options.outputFileFormat === 'function';
            if (outputIsFunction) {
                // backward compatibility
                this.options.outputFileFormat = {
                    multi: this.options.outputFileFormat
                };
            }
            var noFileOutputDefined = !this.options.outputFileFormat;
            var hasSingleFileOutput = (0, _lodash2.default)(this.options, 'outputFileFormat.single');
            var hasMultiFileOutput = (0, _lodash2.default)(this.options, 'outputFileFormat.multi');
            if (noFileOutputDefined || hasMultiFileOutput) {
                this.onMultiFileOutput();
            }
            if (hasSingleFileOutput) {
                this.onSingleFileOutput();
            }
            var epilogue = this.baseReporter.epilogue;

            epilogue.call(this.baseReporter);
        }
    }, {
        key: 'onSingleFileOutput',
        value: function onSingleFileOutput() {
            var xml = this.prepareXml(this.baseReporter.stats.runners);
            var filename = 'WDIO.xunit.all.xml'; // default
            if (typeof (0, _lodash2.default)(this.options, 'outputFileFormat.single') === 'function') {
                filename = this.options.outputFileFormat.single({
                    config: this.config
                });
            }
            this.write(filename, xml);
        }
    }, {
        key: 'onMultiFileOutput',
        value: function onMultiFileOutput() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.baseReporter.stats.runners)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cid = _step.value;

                    var capabilities = this.baseReporter.stats.runners[cid];
                    var singleRunner = {};
                    singleRunner[cid] = capabilities;
                    var xml = this.prepareXml(singleRunner);
                    var filename = 'WDIO.xunit.' + capabilities.sanitizedCapabilities + '.' + cid + '.xml'; // default
                    if (typeof (0, _lodash2.default)(this.options, 'outputFileFormat.multi') === 'function') {
                        filename = this.options.outputFileFormat.multi({
                            capabilities: capabilities.sanitizedCapabilities,
                            cid: cid,
                            config: this.config
                        });
                    }
                    this.write(filename, xml);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: 'prepareName',
        value: function prepareName() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Skipped test';

            return name.split(this.suiteNameRegEx).filter(function (item) {
                return item && item.length;
            }).join('_');
        }
    }, {
        key: 'prepareXml',
        value: function prepareXml(runners) {
            var builder = _junitReportBuilder2.default.newBuilder();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(runners)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    var capabilities = runners[key];
                    var packageName = this.options.packageName ? capabilities.sanitizedCapabilities + '-' + this.options.packageName : capabilities.sanitizedCapabilities;

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = Object.keys(capabilities.specs)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var specId = _step3.value;

                            var spec = capabilities.specs[specId];

                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = Object.keys(spec.suites)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var suiteKey = _step4.value;

                                    /**
                                     * ignore root before all
                                     */
                                    /* istanbul ignore if  */
                                    if (suiteKey.match(/^"before all"/)) {
                                        continue;
                                    }

                                    var suite = spec.suites[suiteKey];
                                    var suiteName = this.prepareName(suite.title);
                                    var testSuite = builder.testSuite().name(suiteName).timestamp(suite.start).time(suite.duration / 1000).property('specId', specId).property('suiteName', suite.title).property('capabilities', capabilities.sanitizedCapabilities).property('file', spec.files[0].replace(process.cwd(), '.'));

                                    var _iteratorNormalCompletion5 = true;
                                    var _didIteratorError5 = false;
                                    var _iteratorError5 = undefined;

                                    try {
                                        for (var _iterator5 = Object.keys(suite.tests)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                            var testKey = _step5.value;

                                            if (testKey !== 'undefined') {
                                                // fix cucumber hooks crashing reporter
                                                var test = suite.tests[testKey];
                                                var testName = this.prepareName(test.title);
                                                var testCase = testSuite.testCase().className(packageName + '.' + suiteName).name(testName).time(test.duration / 1000);

                                                if (test.state === 'pending') {
                                                    testCase.skipped();
                                                }

                                                if (test.error) {
                                                    var errorOptions = this.options.errorOptions;
                                                    if (errorOptions) {
                                                        var _iteratorNormalCompletion6 = true;
                                                        var _didIteratorError6 = false;
                                                        var _iteratorError6 = undefined;

                                                        try {
                                                            for (var _iterator6 = Object.keys(errorOptions)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                                                var _key = _step6.value;

                                                                testCase[_key](test.error[errorOptions[_key]]);
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError6 = true;
                                                            _iteratorError6 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                                    _iterator6.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError6) {
                                                                    throw _iteratorError6;
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        // default
                                                        testCase.error(test.error.message);
                                                    }
                                                    testCase.standardError('\n' + test.error.stack + '\n');
                                                }

                                                var output = this.getStandardOutput(test);
                                                if (output) testCase.standardOutput('\n' + output + '\n');
                                            }
                                        }
                                    } catch (err) {
                                        _didIteratorError5 = true;
                                        _iteratorError5 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                                _iterator5.return();
                                            }
                                        } finally {
                                            if (_didIteratorError5) {
                                                throw _iteratorError5;
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                        _iterator4.return();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return builder.build();
        }
    }, {
        key: 'getStandardOutput',
        value: function getStandardOutput(test) {
            var _this2 = this;

            /* istanbul ignore if  */
            if (this.options.writeStandardOutput === false) {
                return '';
            }
            var standardOutput = [];
            test.output.forEach(function (data) {
                switch (data.type) {
                    case 'command':
                        standardOutput.push('COMMAND: ' + data.payload.method.toUpperCase() + ' ' + (data.payload.uri.href + ' - ' + _this2.format(data.payload.data)));
                        break;
                    case 'result':
                        standardOutput.push('RESULT: ' + _this2.format(data.payload.body));
                        break;
                }
            });
            return standardOutput.length ? standardOutput.join('\n') : '';
        }
    }, {
        key: 'write',
        value: function write(filename, xml) {
            /* istanbul ignore if  */
            if (!this.options || typeof this.options.outputDir !== 'string') {
                return console.log('Cannot write xunit report: empty or invalid \'outputDir\'.');
            }

            try {
                var dir = _path2.default.resolve(this.options.outputDir);
                var filepath = _path2.default.join(dir, filename);
                _mkdirp2.default.sync(dir);
                _fs2.default.writeFileSync(filepath, xml);
                console.log('Wrote xunit report "' + filename + '" to [' + this.options.outputDir + '].');
            } catch (e) {
                /* istanbul ignore next */
                console.log('Failed to write xunit report "' + filename + '"\n             to [' + this.options.outputDir + ']. Error: ' + e);
            }
        }
    }, {
        key: 'format',
        value: function format(val) {
            return JSON.stringify(this.baseReporter.limit(val));
        }
    }]);

    return JunitReporter;
}(_events2.default.EventEmitter);

exports.default = JunitReporter;
module.exports = exports['default'];