function gen_options(limit) {
    var res = "";
        for (var i = 1; i <= limit; ++i) {
            res += '<option value="' + i + '">' + i + '</option>';
        }
        return res;
}

function rank_change(elem) {
    $("#rank_number").children().remove();
    $("#rank_number").append(gen_options((elem.value == 'd' ? 7 : 30)));
}

$(document).ready(function(){



$("body").ready(function(){ 
    rank_change({value: 'k'}) 
})

$("#rank_select").on("change", function() {
    rank_change(this) } 
)

var users = [];

$("#add_participant").submit(function(e){
    e.preventDefault();
    name = $("#name").val();
    rank = $('#rank_number').val() + $('#rank_select').val();
    users.push({name: name, rank: rank })
    $("#participants").append("<tr id=user-"+users.length+"><td>"+name+"</td><td>"+rank+"</td></tr>");


})





});

