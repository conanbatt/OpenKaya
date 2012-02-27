
task :default => :test

desc "Run all test scripts"
task :test do
  current_dir = Dir.new(File.dirname(__FILE__))
  current_dir.each  do |file|
    require  File.expand_path(file, File.dirname(__FILE__)) unless (!file.include?(".rb") or file == __FILE__ or file.include?("helper.rb"))
  end
end