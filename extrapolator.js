function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};


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


function makeKey(rotation1, rotation2, results) {
    var key = '';
    for(var i = 0; i < rotation1.length; i++){
        if (rotation1[i] == rotation2[i]) {
            key += results[i];
        }
    }
    return key;
};


function functionReplacer(key, value) {
    if (typeof(value) === 'function') {
        return value.toString();
    }
    return value;
};

function functionReviver(key, value) {
    if (key === "") return value;
    
    if (typeof value === 'string') {
        var rfunc = /function[^\(]*\(([^\)]*)\)[^\{]*{([^\}]*)\}/,
            match = value.match(rfunc);
        
        if (match) {
            var args = match[1].split(',').map(function(arg) { return arg.replace(/\s+/, ''); });
            return new Function(args, match[2]);
        }
    }
    return value;
};


function aliceKeygen () {
    var n = 10;
    var nlist = [];

    for (x of range(parseInt(n/10))) {
        nlist.push(10);
    }
    if(n%10 != 0) {
        nlist.push(n%10);
    }

    console.log(nlist);

    var key = randomStringGen(n)
    console.log("Alice>> initKey: ", key);

    var aliceRotate = randomStringGen(n);
    var bobRotate = randomStringGen(n);
    console.log("Alice>> Alice's rotation string: ", aliceRotate);
    console.log("Alice>> Bob's rotation string: ", bobRotate);


    // Should reformat this to work with server by JSON-RPC
    var qcList = [];
    var bobResult = '';

    var index = 0;
    console.log("NLIST: ", nlist);
    for (len of nlist) {
        console.log("LEN: ", len);
        if (len < 10){
            var key_temp = key.slice(10*index, 10*index+len);
            aliceRotate_temp = aliceRotate.slice(10*index, 10*index+len);
            bobRotate_temp = bobRotate.slice(10*index, 10*index+len);
        }
        else {
            var key_temp = key.slice(len*index, len*(index+1));
            var aliceRotate_temp = aliceRotate.slice(len*index, len*(index+1));
            var bobRotate_temp = bobRotate.slice(len*index, len*(index+1));
        }

        var qubitSystem = new QuantumCircuit(len);
        
        var count = 0;
        for (let index=0; index<key_temp.length; index++) {
            var i = parseInt(key_temp[count])
            var j = parseInt(aliceRotate_temp[count])

            if (i > 0){
                qubitSystem.addGate("x", -1, count);
            }
            if (j > 0) {
                qubitSystem.addGate("h", -1, count);
            }

            qubitSystem.addMeasure(count, "c", count); 
            count += 1;
        }

        qcList.push(qubitSystem.save());
        console.log(qcList);

        qubitSystem.run();


    }

    var Akey = makeKey(bobRotate, aliceRotate, key);

    console.log("Alice>> Bob's RESULT: ", bobResult);

    console.log("Alice>> Alice's Key: ", Akey);
    
    var result = {
        "qcList": qcList,
        "aliceRotate": aliceRotate,
        "bobRotate": bobRotate,
        "nlist": nlist
    }

    return {"Akey": Akey, "LASER": JSON.stringify(result)};
};


function bobKeygen(laser) {
    var sonic = JSON.parse(laser);
    
    var qcList = sonic.qcList;
    var aliceRotate = sonic.aliceRotate;
    var bobRotate = sonic.bobRotate;
    var nlist = sonic.nlist;
    var bobResult = '';

    console.log("Bob>> AliceRotate: ", aliceRotate);
    console.log("Bob>> BobRotate: ", bobRotate);

    var index = 0;
    var count;
    var bobRotate_temp;
    for (len of nlist) {
        if (len < 10) {
            bobRotate_temp = bobRotate.slice(10*index, 10*index+len);
        }
        else {
            bobRotate_temp = bobRotate.slice(len*index, len*(index+1));
        }

        var qubitSystem = new QuantumCircuit();
        qubitSystem.load(qcList[index]);
        console.warn(qubitSystem);

        count = 0;
        for (k of bobRotate_temp) {
            k = parseInt(k);
            
            if (k > 0) {
                qubitSystem.addGate("h", -1, count);
            }
            qubitSystem.addMeasure(count, "c", count);
            count += 1;
        }



        qubitSystem.run();
        bobResult_temp = '';
        
        bobResult_temp += qubitSystem.getCreg("c", k).join('');
        bobResult += bobResult_temp;

        index += 1;

    }

    console.log("Bob>> Bob's results: ", bobResult);

    var Bkey = makeKey(bobRotate, aliceRotate, bobResult);

    console.log("Bob>> Bob's key: ", Bkey);

    return Bkey;
    

};