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

