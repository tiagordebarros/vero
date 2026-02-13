const traceExample = () => {
  function foo() {
    function bar() {
      console.trace();
    }
    bar();
  }

  foo();
};

console.clear();
console.log("-----------------------------------------------");
console.log("Starting demo of all native stable console methods...");
console.log("Log example");
console.info("Info example");
console.warn("Warning example");
console.error("Error example");
console.debug("Debug example");
console.table([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]);
console.time("Timer example");
console.timeEnd("Timer example");
console.time("answer time");
alert("Click to continue");
console.timeLog("answer time");
alert("Do a bunch of other stuff…");
console.timeEnd("answer time");
console.assert(1 === 1, "This will not log");
console.assert((1 as number) === 2, "This will log an assertion error");
console.count("Count example");
console.count("Count example");
console.log("Count reset");
console.countReset("Count example");
console.count("Count example");
console.group("Group example");
console.log("Inside group");
console.groupEnd();
console.groupCollapsed("Collapsed group example");
console.log("Inside collapsed group");
console.groupEnd();
console.dir({ name: "Charlie", age: 35 });
console.dirxml({ id: 1, name: "Valid example", type: "dirxml" });
console.trace(traceExample);
console.log("End of all console methods demo");
console.log("-----------------------------------------------");
