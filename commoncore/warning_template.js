/**********************************************************************/
/** WARNING: DO NOT EDIT FILE DIRECTLY IT IS AUTOMATICALLY GENERATED **/
/**********************************************************************/
(function() {
    var stds = <%=JSON.stringify(exports, null, 4)%>;
    exports.find = function(key) {
        if (stds.map[key]!==undefined) {
            var std = _.clone(stds.data[stds.map[key]]);
            
            return _.extend(std, { fw: stds.frameworks[std.fw] });
        }
        return null;
    }
})();
