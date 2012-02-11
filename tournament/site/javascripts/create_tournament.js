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

function ParticipantList(){

    this.participants = [];
    var that = this;
    $("#participants").on("click", "button.delete", function(){
        id = Number($(this).parents("tr").attr("ip"));
        that.participants.splice(id);
        that.draw_participant_list();
    });

    this.draw_participant_list = function(){
        $("#participants").find("tr[ip]").remove();
        for(var i=0;i<that.participants.length;i++){
            $("#participants").append("<tr ip="+i+" id=user-"+i+">"+
                                    "<td>"+that.participants[i].name+"</td>"+
                                    "<td>"+that.participants[i].rank+"</td>"+
                                    "<td><button class='delete'>delete</button></td>"+
                                  "</tr>");
        }
    }
    this.add_participant = function(participant){
        if(get_participant_by_name(participant.name)){ throw "A user with that nickname is already in the list"; }        
        $("#participants").append("<tr ip="+that.participants.length+" id=user-"+that.participants.length+">"+
                                    "<td>"+participant.name+"</td>"+
                                    "<td>"+participant.rank+"</td>"+
                                    "<td><button class='delete'>delete</button></td>"+
                                  "</tr>");
        that.participants.push(participant);
    }

    function get_participant_by_name(name){
        for(var i =0;i<that.participants.length;i++){
            if(that.participants[i].name == name){ return that.participants[i]; } 
        }
    }

}

$(document).ready(function(){



var participant_list = new ParticipantList();

$("body").ready(function(){ 
    rank_change({value: 'k'}) 
});

$("#rank_select").on("change", function() {
    rank_change(this)
});


$("#add_participant").submit(function(e){
    e.preventDefault();
    rank = $('#rank_number').val() + $('#rank_select').val();
    new_participant = {name:$("#name").val(), rank: rank}
    participant_list.add_participant(new_participant);
});

$("#create_tournament").submit(function(e){
    e.preventDefault();
    $.post("/create", {system: $("#system").val(),
                       participants: participant_list.participants})


});

});


