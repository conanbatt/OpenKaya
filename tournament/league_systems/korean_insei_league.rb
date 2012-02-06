require File.expand_path("../league", File.dirname(__FILE__))

class KoreanInseiLeague < League

  ########################################################
  
  # Korean Insei League 
  
  # As described on http://insei-league.com/
  
  #TODO 
  
  #- Implement "Q. I am in A group. Can I spoil my winning %, if I lose someone from the supergroup?" rule
  
  ########################################################
  
  def initialize(players, options)
    super players
    @max_group_size = ((options.has_key?(:max_group_size)) ? options[:max_group_size]:12)
    @upper_bar = ((options.has_key?(:upper_bar)) ? options[:upper_bar]:4) #each period, how many are promoted?
    @lower_bar = ((options.has_key?(:lower_bar)) ? options[:lower_bar]:4) #each period, how many are demoted?
    @supergroup_allowed = ((options.has_key?(:supergroup_allowed)) ? options[:supergroup_allowed]:true)
    @supergroup_size = ((options.has_key?(:supergroup_size)) ? options[:supergroup_size]:5) #usual value: 5 
    @supergroup_min_rank = ((options.has_key?(:supergroup_min_rank)) ? options[:supergroup_min_rank]: "4d")#only used when SuperGroup is created
    @supergroup_lower_bar = ((options.has_key?(:supergroup_lower_bar)) ? options[:supergroup_lower_bar]:1) #each period, how many are demoted from SuperGroup?
    @supergroup_upper_bar = ((options.has_key?(:supergroup_upper_bar)) ? options[:supergroup_upper_bar]:1) #each period, how many are promoted from A group?
    @group_names = ((options.has_key?(:group_names)) ? options[:group_names]:["Supergroup", "Group A","Group B","Group C","Group D","Group E1","Group E2","Group E3"])
  end
 
  def player_already_in_group?(group_array, player)
    group_array.each do |g|
      g.players.each do |p|
        return true if (player == p)
      end
    end
    return false
  end
  
  def get_group_index_from_name(group_array, name)
      group_array.each do |g|
      if g.name == name
        return group_array.index(g)
      end
    end
    return -1  
  end
  
  def get_group_from_name(group_array, name)
    group_array.each do |g|
      if g.name == name
        return g
      end
    end
    return nil
  end
  
  def build_groups
    groups = []
    
    #First period: groups are filled from top to bottom, by rank
    if @periods.empty?
      available_players = players.sort { |x,y| compare_ranks(y.rank,x.rank) }
     
      #can a supergroup be created?
      supergroup_shift = 1
      if @supergroup_allowed && available_players.size > (@max_group_size + @supergroup_size) && compare_ranks(available_players[@supergroup_size-1].rank, @supergroup_min_rank) >= 0
          supergroup_shift = 0
          super_group_players = []
          @supergroup_size.times do 
            super_group_players << available_players.shift
          end
          groups << Group.new(super_group_players, @group_names[0])
      end
      #normal groups
      begin
        group_players = []
        @max_group_size.times do 
          group_players << available_players.shift
        end
        groups << Group.new(group_players, @group_names[groups.size + supergroup_shift])
      end while available_players.size >= @max_group_size
      #not enough players to fill a full group: if enough to make a half group create a new group, 
      #otherwise, just append to last group (unless it's the supergroup)
      if available_players.size >= @max_group_size / 2 && groups.last.name != @group_names[0]
        groups << Group.new(available_players, @group_names[groups.size + supergroup_shift])
      else
        available_players.size.times do
          groups.last.players << available_players.shift
        end
      end
    else
    #Second period onward: scores (percentage) are calculated, @upper_bar with highest score in the group go up, @lower_bar with lowest percentage go down
    #people with less than 10 games are dropped to the bottom (could be deleted), people with 0 games are deleted automatically

      #0. remove all non playing players and sort rest by score
      players.delete_if {|x| result_by_player(x).size == 0 && !@periods.last.group_by_player(p).nil?}
      available_players = players.sort! {|x,y| score_by_player(x) <=> score_by_player(y)}
      
      #1. create all groups 
      #1.1 same as previous period by default
      #1.2 if supergroup allowed and it wasn't created before, check if it's now possible
      if @supergroup_allowed && @periods.last.groups[0].name != @group_names[0] #1.2
          supergroup_players = players.sort { |x,y| compare_ranks(y.rank,x.rank) }
          if supergroup_players.size > (@max_group_size + @supergroup_size) && compare_ranks(supergroup_players[@supergroup_size-1].rank, @supergroup_min_rank) >= 0
            groups << Group.new([], @group_names[0])
          end
      end
      @periods.last.groups.each do |g| #1.1
        groups << Group.new([], g.name) unless (g.name == @group_names[0] && !groups.empty? && groups[0].name == @group_names[0]) 
      end

      new_players = []
      
      #2. Put players in their groups
      #2.1 New player goes in last group or fill in the blanks
      #2.2 Other players are moved within groups based on their position in previous Period
        available_players.each do |p|
        previous_group = @periods.last.group_by_player(p)
        if previous_group.nil? #2.2
          new_players << p
        else
          #players in the same group as current player, sorted by score
          group_players = previous_group.players.sort! {|x,y| score_by_player(y) <=> score_by_player(x)}
          #position of current player within his group
          group_position = group_players.index(p) 
          #current group index in group_name. 0 == supergroup, 1==group A, 2+ = remaining groups
          group_index = @group_names.index(previous_group.name)
          #group above the current player's current group
          group_above = (get_group_index_from_name(groups, previous_group.name) >= 1) ? groups[get_group_index_from_name(groups, previous_group.name)-1] : nil
          #group below the current player's current group
          group_below = (get_group_index_from_name(groups, previous_group.name) < groups.size - 1) ? groups[get_group_index_from_name(groups, previous_group.name)+1] : nil
          #same group but in the output groups array
          group_same = groups[get_group_index_from_name(groups, previous_group.name)]
          
          #in A group, promoted to super group if position < @supergroup_upper_bar OR it's the first time the supergroup is opened:
          if (!group_above.nil? && group_above.name == @group_names[0] && ((@periods.last.groups[0].name == @group_names[0] && group_position < @supergroup_upper_bar) || (@periods.last.groups[0].name != @group_names[0] && group_above.players.size < @supergroup_size)))
            group_above.players<<p
            #puts p.name + " (A) got promoted to " + groups[@group_names.index(previous_group.name)-1].name + " from " + previous_group.name
          end
          #in groups below A, normal rule:
          if(group_position < @upper_bar && !group_above.nil? && group_above.name != @group_names[0])
            group_above.players<<p
            #puts p.name + " (not A) got promoted to " + groups[@group_names.index(previous_group.name)-1].name + " from " + previous_group.name  
          end
          #in Supergroup, demoted to A group:
          if(group_same.name == @group_names[0] && group_position >= group_players.size - @supergroup_lower_bar && !group_below.nil?)
            group_below.players<<p
            #puts p.name + " (S) got demoted to " + groups[@group_names.index(previous_group.name)+1].name + " from " + previous_group.name  
          end
          #in groups below Supergroup, normal rule:
          if(group_same.name != @group_names[0] && group_position >= group_players.size - @lower_bar && !group_below.nil?)
            group_below.players<<p
            #puts p.name + " (not S) got demoted to " + groups[@group_names.index(previous_group.name)+1].name + " from " + previous_group.name  
          end

          if !player_already_in_group?(groups, p)
            group_same.players<<p
            #puts p.name + " stays in " + groups[@group_names.index(previous_group.name)].name
          end
        end
      end
      
      #3. Adjust groups
      #3.1. New players fill the blanks
      #3.2. Too many people in last group: split
      #3.3. Not enough people in last group: merge
      new_players.sort{ |x,y| compare_ranks(y.rank,x.rank) }.each do |p|
        added = false
        groups.each do |g|
          if !added && ((g.name == @group_names[0] && g.players.size < @supergroup_size) || (g.name != @group_names[0] && g.players.size < @max_group_size))
            g.players << p
            added = true
          end
        end
        if !added
          groups.last.players << p
        end
      end
    end
    if groups.last.players.size >  @max_group_size * 1.5
      group_to_create = Group.new([],@group_names[@group_names.index(groups.last.name)+1])
      groups.last.players.sort!{ |x,y| compare_ranks(y.rank,x.rank) }
      begin
        group_to_create.players << groups.last.players.pop
      end while groups.last.players.size > @max_group_size
      groups<<group_to_create
    elsif groups.last.players.size < @max_group_size * 0.5 and groups.last.name != @group_names[0]
      group_to_delete = groups.pop
      groups.last.players.concatenate(groups_to_delete.players)
    end
    
    return groups
  end
  
  def result_by_player(player)
    #results are only for the current period
    #only 4 first games per period are counted vs each player
    #inter groups not allowed, except between SuperGroup (group 0) and Group A (group 1), 1 time per period
    results = []
    raise "League has not started yet" if @periods.nil?
    player_group = @periods.last.group_by_player(player)
    return results if player_group.nil? #raise "No Group for player " + player.name if player_group.nil?
    player_group.pairings.each do |pairing|          
        if pairing.black_player == player || pairing.white_player == player
          opponent_group = (pairing.black_player == player) ? @periods.last.group_by_player(pairing.white_player) : @periods.last.group_by_player(pairing.black_player)
          if opponent_group != player_group
            if (opponent_group.name == @group_names[0] && player_group.name == @group_names[1]) || (player_group.name == @group_names[0] && opponent_group.name == @group_names[1])
              results << pairing if results.count{|x| (x.black_player==pairing.black_player&&x.white_player==pairing.white_player)||(x.white_player==pairing.black_player&&x.black_player==pairing.white_player)} == 0
            end
          else
              results << pairing if results.count{|x| (x.black_player==pairing.black_player&&x.white_player==pairing.white_player)||(x.white_player==pairing.black_player&&x.black_player==pairing.white_player)} < 4
          end
        end
    end
    return results
  end
  
  def score_by_player(player)
    #scores are only for current period
    results = result_by_player(player)
    played_games = results.size
    if played_games == 0
      return 0
    end
    won_games = 0
    results.each do |r|
      if r.winner == player
        won_games = won_games + 1
      end
    end
    base_percentage = (won_games * 100) / played_games
    bonus_percentage = ((results.size > 12) ? results.size - 12 : 0)
    score = base_percentage + bonus_percentage
    return score
    #return (score <= 100) ? score : 100
  end
  
  def output
    @periods.each do |period|
      puts "# Period from " + period.start_time.strftime("%Y/%m/%d") + " to " +  ((period.end_time.nil?) ? "Now" : period.end_time.strftime("%Y/%m/%d") )
      period.groups.each do |group|
        puts "   * " + group.name + "( " + group.players.size.to_s + " players(s) )"
        group.players.each do |player|
          puts "     - " + player.name + " " + player.rank
        end
      end      
    end
    puts "# Current results:"
    @periods.last.groups.each do |group|
        group.players.each do |player|
          puts "   * " + player.name + " " + player.rank + " : " + score_by_player(player).to_s + "%"
        end
    end    
  end

  # ==  0 if same rank
  # ==  1 if a rank is better than b rank
  # == -1 if b rank is better than a rank
  def compare_ranks(rank_a, rank_b)
      if rank_a == rank_b
          return 0
      end
      if rank_a[-1,1] == "k" and rank_b[-1,1] == "d"
          return -1
      end
      if rank_b[-1,1] == "k" and rank_a[-1,1] == "d"
          return 1
      end
      if rank_a[-1,1] == "k" 
          return (rank_a[0, rank_a.length-1].to_i < rank_b[0, rank_b.length-1].to_i) ? 1 : -1
      end
      if rank_a[-1,1] == "d"
          return (rank_a[0, rank_a.length-1].to_i > rank_b[0, rank_b.length-1].to_i) ? 1 : -1
      end
  end
end

