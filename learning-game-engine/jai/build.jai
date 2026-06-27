#import "Compiler";
#import "Basic";
#import "File";

#run build();

build :: () {
    set_build_options_dc(.{do_output = false});

    out := tprint("%build", #filepath);
    make_directory_if_it_does_not_exist(out);

    w := compiler_create_workspace("Learning Engine - Jai");

    options := get_build_options(w);
    options.output_type            = .EXECUTABLE;
    options.output_executable_name = "main";
    options.output_path            = out;
    set_build_options(options, w);

    add_build_file(tprint("%src/main.jai", #filepath), w);
}
