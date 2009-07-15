require 'yaml'
require 'pathname'
require 'fileutils'
require 'erb'
require 'rubygems'
require 'json'

class Chlorine

  def self.compile path
    source_pn = Pathname.new path
    manifest_pn = source_pn.join 'manifest.json'

    if manifest_pn.exist?
      build_dir = Pathname.new '_chlorine_build'
      manifest = JSON.load IO.read(manifest_pn)

      unless validate_manifest manifest
        raise 'Invalid manifest.'
      end

      if build_dir.exist?
        raise 'build_dir exist.'
      end

      manifest['dir_name'] = fs_escape manifest['name']
      manifest['dir_path'] = build_dir.join(manifest['dir_name']).cleanpath.to_s
      manifest['source_dir'] = source_pn.to_s

      FileUtils.mkdir_p build_dir
      compile_firefox_extension manifest
      FileUtils.rm_rf build_dir
    else
      raise 'manifest.json not found.'
    end
  end

  def self.validate_manifest manifest
    # FIXME
    true
  end

  def self.compile_firefox_extension manifest
    ## templates_pn = Pathname.new 'templates/firefox_extension'
    templates_pn = Pathname.new(__FILE__).
      cleanpath.parent.parent.join('templates', 'firefox_extension')
    output_pn = Pathname.new('./').realpath
    dir = Pathname.new(manifest['dir_path'])
    cont_pn = dir.join 'chrome', 'content'

    FileUtils.cp_r templates_pn, dir
    Dir.glob(manifest['source_dir'] + '/*').each do |i|
      FileUtils.cp_r i, cont_pn
    end

    Pathname.glob(dir + '**/*.erb').each do |i|
      f = i.to_s.gsub(/\.erb$/, '')
      open(f, 'w') { |f| f.write ERB.new(IO.read(i)).result(binding) }
      FileUtils.rm i
    end

    usc_js_pn = cont_pn.join 'chlorine.js'
    inject_script = <<-EOS
var appID = '#{manifest['firefox_extension_id']}'
    var appDirName = '#{manifest['dir_name']}'
EOS
    usc_js = IO.read(usc_js_pn).gsub('// *INJECT_CHLORINE*', inject_script)
    open(usc_js_pn, 'w') { |f| f.puts usc_js }

    FileUtils.cd dir do
      xpi = output_pn.join(manifest['dir_name']).to_s + '.xpi'
      system "zip -qr -9 #{xpi} *"
      puts "create: #{xpi}"
    end
  end

  def self.fs_escape name
    # FIXME
    name.gsub(/[\s\/]/, '_').downcase
  end
end
