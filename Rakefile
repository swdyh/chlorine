require 'rubygems'
require 'rake'
require 'rake/clean'
require 'rake/testtask'
require 'rake/rdoctask'
require 'fileutils'
include FileUtils

NAME              = "chlorine"
AUTHOR            = "swdyh"
EMAIL             = "http://mailhide.recaptcha.net/d?k=01AhB7crgrlHptVaYRD0oPwA==&c=L_iqOZrGmo6hcGpPTFg1QYnjr-WpAStyQ4Y8ShfgOHs="
DESCRIPTION       = "Browser extension generator"
RUBYFORGE_PROJECT = ""
HOMEPATH          = ""
BIN_FILES         = %w(chlorine)
VERS              = "0.0.1"

REV = File.read(".svn/entries")[/committed-rev="(d+)"/, 1] rescue nil
CLEAN.include ['**/.*.sw?', '*.gem', '.config', '*.gemspec', '**/*.xpi', '**/.DS_Store', '.rake_tasks']
RDOC_OPTS = [
	'--title', "#{NAME} documentation",
	"--charset", "utf-8",
	"--opname", "index.html",
	"--line-numbers",
	"--main", "README.rdoc",
	"--inline-source",
]

task :default => [:test]
task :package => [:clean]

Rake::TestTask.new("test") do |t|
	t.libs   << "test"
	t.pattern = "test/**/*_test.rb"
	t.verbose = true
end

spec = Gem::Specification.new do |s|
	s.name              = NAME
	s.version           = VERS
	s.platform          = Gem::Platform::RUBY
	s.has_rdoc          = true
	s.extra_rdoc_files  = ["README.rdoc", "ChangeLog"]
	s.rdoc_options     += RDOC_OPTS + ['--exclude', '^(examples|extras)/']
	s.summary           = DESCRIPTION
	s.description       = DESCRIPTION
	s.author            = AUTHOR
	s.email             = EMAIL
	s.homepage          = HOMEPATH
	s.executables       = BIN_FILES
	s.rubyforge_project = RUBYFORGE_PROJECT
	s.bindir            = "bin"
	s.require_path      = "lib"
	s.test_files        = Dir["test/*_test.rb"]

	s.add_dependency('json', '>=1.1.4')
	#s.required_ruby_version = '>= 1.8.2'

	s.files = %w(README.rdoc ChangeLog Rakefile) +
		Dir.glob("{bin,doc,test,lib,templates,generator,extras,website,script}/**/*") + 
		Dir.glob("ext/**/*.{h,c,rb}") +
		Dir.glob("examples/**/*.rb") +
		Dir.glob("tools/*.rb")

	s.extensions = FileList["ext/**/extconf.rb"].to_a
end

Rake::RDocTask.new do |rdoc|
	rdoc.rdoc_dir = 'html'
	rdoc.options += RDOC_OPTS
	rdoc.template = "resh"
	#rdoc.template = "#{ENV['template']}.rb" if ENV['template']
	if ENV['DOC_FILES']
		rdoc.rdoc_files.include(ENV['DOC_FILES'].split(/,\s*/))
	else
		rdoc.rdoc_files.include('README.rdoc', 'ChangeLog')
		rdoc.rdoc_files.include('lib/**/*.rb')
		rdoc.rdoc_files.include('ext/**/*.c')
	end
end

desc 'build gem'
task :gem do
	open("#{NAME}.gemspec", 'w') { |f| f.puts spec.to_ruby }
	sh "gem build #{NAME}.gemspec"
end
