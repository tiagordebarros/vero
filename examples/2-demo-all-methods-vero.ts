import { logger } from "../src/mod.ts";

const traceExample = () => {
  function foo() {
    function bar() {
      console.trace();
    }
    bar();
  }

  foo();
};

// TODO: create special Vero header method to display header with style

console.clear(); // TODO: create new Vero method to clear console with style
logger.hr();
logger.log("Starting demo of native console methods...");
logger.log("Log example");
logger.info("Info example");
logger.warn("Warning example");
logger.error("Error example");
logger.debug("Debug example");
logger.table([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]);
logger.time("Timer example");
logger.timeEnd("Timer example");
logger.time("answer time");
alert("Click to continue");
console.timeLog("answer time"); // TODO: create Vero method for timeLog
alert("Do a bunch of other stuff…");
logger.timeEnd("answer time");
console.assert(1 === 1, "This will not log");
console.assert((1 as number) === 2, "This will log an assertion error");
console.count("Count example");
console.count("Count example");
logger.log("Count reset");
console.countReset("Count example");
console.count("Count example");
console.group("Group example");
logger.log("Inside group");
console.groupEnd();
console.groupCollapsed("Collapsed group example");
logger.log("Inside collapsed group");
console.groupEnd();
console.dir({ name: "Charlie", age: 35 });
console.dirxml({ id: 1, name: "Valid example", type: "dirxml" });
console.trace(traceExample);
logger.log("End of all console methods demo");
logger.hr();
