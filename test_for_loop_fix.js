// Test script to verify FOR loop fixes
const { Interpreter } = require('./src/interpreter');
const { Parser } = require('./src/parser');

function testForLoop(code, description) {
    console.log(`\n=== ${description} ===`);
    console.log(`Code: ${code}`);

    try {
        const parser = new Parser();
        const ast = parser.parse(code);
        const interpreter = new Interpreter();

        const outputs = [];
        for (const output of interpreter.executeProgram(ast)) {
            outputs.push(output);
        }

        console.log(`Output: ${outputs.join(', ')}`);
        return outputs;
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return null;
    }
}

// Test Case 1: Basic forward loop (integer values)
testForLoop('FOR i ← 1 TO 5 STEP 1\n    OUTPUT i\nNEXT i', 'Basic forward loop');

// Test Case 2: Forward loop with fractional step
testForLoop('FOR i ← 1 TO 5 STEP 1.5\n    OUTPUT i\nNEXT i', 'Forward loop with fractional step');

// Test Case 3: Backward loop with fractional step
testForLoop('FOR i ← 5 TO 1 STEP -1.5\n    OUTPUT i\nNEXT i', 'Backward loop with fractional step');

// Test Case 4: Fractional start value
testForLoop('FOR i ← 1.5 TO 5 STEP 1\n    OUTPUT i\nNEXT i', 'Fractional start value');

// Test Case 5: Boundary condition test
testForLoop('FOR i ← 1 TO 3 STEP 0.5\n    OUTPUT i\nNEXT i', 'Boundary condition test');

console.log('\n=== Test completed ===');