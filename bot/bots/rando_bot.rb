class RandoBot
  def input(move)
    return [random_letter,random_letter]
    #%x[command computer to play]
  end

  def random_letter
    (rand(19)+97).chr
  end
end
