require 'yaml'
require 'pathname'
require 'fileutils'
require 'erb'
require 'rubygems'
require 'json'

class Chlorine

  def self.compile path
    pn = Pathname.new path
    case pn.extname
    when '.yml'
      manifest = YAML.load_file pn
    when '.json'
      manifest = JSON.load IO.read(pn)
    else
      raise 'Unsupport format.'
    end

    unless validate manifest
      raise 'Invalid manifest.'
    end
    compile_firefox_extension manifest
  end

  def self.validate manifest
    # FIXME
    true
  end

  def self.compile_firefox_extension config
    template_pn = Pathname.new(__FILE__).
      cleanpath.parent.parent.join('templates', 'firefox_extension')
    output_pn = Pathname.new(config['output_dir'] || './').realpath
    config['name_lower'] = fs_escape config['name']
    dir = output_pn.join config['name_lower']
    cont_pn = dir.join 'chrome', 'content'

    if dir.exist?
      raise "Dir #{dir} exists."
    end

    FileUtils.cp_r template_pn, dir

    if config['content_dir']
      FileUtils.cd config['content_dir'] do
        Pathname.glob('*') { |i| FileUtils.cp_r i, cont_pn }
      end
    end

    Pathname.glob(output_pn + '**/*.erb').each do |i|
      f = i.to_s.gsub(/\.erb$/, '')
      open(f, 'w') { |f| f.write ERB.new(IO.read(i)).result(binding) }
      FileUtils.rm i
    end

    js = config['content_scripts'].select { |i| i['js'] }.map { |i| i['js'] }.flatten
    js.each { |i| FileUtils.cp i, cont_pn }

    usc_js_pn = cont_pn.join 'chlorine.js'
    inject_script = <<-EOS
var appID = '#{config['firefox_extension_id']}'
    var appDirName = '#{config['name_lower']}'
EOS
    usc_js = IO.read(usc_js_pn).gsub('// *INJECT_CHLORINE*', inject_script)
    open(usc_js_pn, 'w') { |f| f.puts usc_js }

    open(cont_pn.join('manifest.json'), 'w') { |f| f.puts JSON.pretty_generate(config) }

    FileUtils.cd dir do
      system "zip -qr -9 ../#{config['name_lower']}.xpi *"
      puts "create: #{dir}.xpi"
    end
    FileUtils.rm_rf dir
  end

  def self.fs_escape name
    # FIXME
    name.gsub(/[\s\/]/, '_').downcase
  end
end
