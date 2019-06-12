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

        
        var container = document.getElementById("drawing");
        var svg = qubitSystem.exportSVG(true);
        container.innerHTML = svg;


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
    

}