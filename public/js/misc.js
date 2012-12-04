function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

function csvtojson(csvfile) {
  var data_pre = $.csv.toObjects(csvfile);
  var data_pos = {};
  $.each(data_pre, function(n, c) {
      data_pos[c['id']] = c;
  });
  return data_pos;
}
