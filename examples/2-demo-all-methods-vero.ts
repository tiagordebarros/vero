import { logger } from "../src/mod.ts";

const traceExample = () => {
  function foo() {
    function bar() {
      logger.trace();
    }
    bar();
  }

  foo();
};

logger.clear();
logger.hr();
logger.h1("Starting demo of all Vero methods...");
logger.log("Log example");
logger.info("Info example");
logger.warn("Warning example");
logger.error("Error example");
logger.debug("Debug example");
logger.success("Success example");
logger.table([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]);
logger.time("Timer example");
logger.timeEnd("Timer example");
logger.time("answer time");
alert("Click to continue");
logger.timeLog("answer time");
alert("Do a bunch of other stuff…");
logger.timeEnd("answer time");
logger.assert(1 === 1, "This will not log");
logger.assert((1 as number) === 2, "This will log an assertion error");
logger.count("Count example");
logger.count("Count example");
logger.log("Count reset");
logger.countReset("Count example");
logger.count("Count example");
logger.group("Group example");
logger.log("Inside group");
logger.groupEnd();
logger.groupCollapsed("Collapsed group example");
logger.log("Inside collapsed group");
logger.groupEnd();
logger.dir({ name: "Charlie", age: 35 });
logger.dirxml({ id: 1, name: "Valid example", type: "dirxml" });
logger.trace(traceExample);
logger.log("End of all Vero methods demo");
logger.hr();
