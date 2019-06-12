function randomStringGen(string_length) {
    output_list = [];
    output = '';

    
    var n = string_length;
    var temp_n = 10;
    var temp_output = '';

    ceil = Math.ceil(n/temp_n);

    for (x of range(ceil)){
        var qubitSystem = new QuantumCircuit(temp_n);
        var qubits = range(temp_n);
        for (var i = 0; i < temp_n; i++) {
            qubitSystem.addGate("h", -1, i);
            qubitSystem.addMeasure(i, "c", i); 
        }


        // var container = document.getElementById("drawing");
        // var svg = qubitSystem.exportSVG(true);
        // container.innerHTML = svg;

        qubitSystem.run();

        for (var j = 0; j<temp_n; j++) {
            temp_output += qubitSystem.getCregBit("c", j);
        }
        output += temp_output;
    }

    return output.slice(0, n);
};