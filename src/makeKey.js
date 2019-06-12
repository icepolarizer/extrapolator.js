function makeKey(rotation1, rotation2, results) {
    var key = '';
    for(var i = 0; i < rotation1.length; i++){
        if (rotation1[i] == rotation2[i]) {
            key += results[i];
        }
    }
    return key;
};
