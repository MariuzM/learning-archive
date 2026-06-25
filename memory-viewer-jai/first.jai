#import "Basic";
#import "Compiler";
#import "File";

build :: () {
    make_directory_if_it_does_not_exist("build");

    w := compiler_create_workspace("memory_viewer");

    options := get_build_options(w);
    options.output_executable_name = "memory_viewer";
    options.output_path            = "build";
    set_build_options(options, w);

    add_build_file("src/main.jai", w);

    set_build_options_dc(.{do_output = false});
}

#run build();
