// Build metaprogram for this project.
//
// App (src/main.jai -> build/app):
//   jai build.jai                 -> release build
//   jai build.jai - dev           -> debug build (bounds checks, no optimization)
//   jai build.jai - dev watch     -> debug build, then rebuild on file changes
//   jai build.jai - watch         -> release build, then rebuild on file changes
//
// Examples (each file in examples/ -> build/examples/<name>, then run):
//   jai build.jai - examples          -> build & run every example once
//   jai build.jai - examples dev      -> same, as debug builds
//   jai build.jai - examples watch    -> rebuild & re-run all when examples/ changes
//   jai build.jai - examples 2        -> build & run only example #2
//   jai build.jai - examples watch 1  -> watch & re-run only example #1
//
// Everything after the lone "-" is passed to this metaprogram, not to the
// compiler. We read those words out of compile_time_command_line below.

#import "Basic";
#import "Compiler";
#import "File";
#import "File_Utilities";  // file_list
#import "Process";         // run_command
#import "String";          // ends_with, path_filename, path_strip_extension
#import "Sort";            // quick_sort, compare_strings

Watcher :: #import "File_Watcher";

SRC_DIR      :: "src";
ENTRY_FILE   :: "src/main.jai";
OUTPUT_DIR   :: "build";
OUTPUT_NAME  :: "app";

EXAMPLES_DIR     :: "examples";
EXAMPLES_OUT_DIR :: "build/examples";

build :: () {
    // This file is the metaprogram; it should not itself produce an executable.
    set_build_options_dc(.{do_output = false});

    args := get_build_options().compile_time_command_line;

    dev      := array_find(args, "dev");
    watch    := array_find(args, "watch");
    examples := array_find(args, "examples");

    if examples {
        // An optional bare number (e.g. "1") selects a single example.
        g_example_filter = find_number_arg(args);
        if g_example_filter >= 0  print("\n== examples :: only #% dev=% watch=% ==\n", g_example_filter, dev, watch);
        else                      print("\n== examples :: all dev=% watch=% ==\n", dev, watch);

        build_and_run_examples(dev);
        if watch  run_watch_loop(EXAMPLES_DIR, build_and_run_examples, dev);
        return;
    }

    print("\n== build :: dev=% watch=% ==\n", dev, watch);
    ok := build_app(dev);
    if watch {
        run_watch_loop(SRC_DIR, build_app_for_watch, dev);
    } else if !ok {
        compiler_set_workspace_status(.FAILED);
    }
}

// ---- App -------------------------------------------------------------------

build_app :: (dev: bool) -> ok: bool {
    return compile_one(OUTPUT_NAME, ENTRY_FILE, OUTPUT_DIR, dev);
}

// Wrapper with the signature run_watch_loop expects (it ignores the return).
build_app_for_watch :: (dev: bool) {
    build_app(dev);
}

// ---- Examples --------------------------------------------------------------

build_and_run_examples :: (dev: bool) {
    files := file_list(EXAMPLES_DIR, recursive = false);
    quick_sort(files, compare_strings);
    if !files.count {
        print("No examples found in '%/'.\n", EXAMPLES_DIR);
        return;
    }

    ran_any := false;
    for file: files {
        if !ends_with(file, ".jai")  continue;

        name := path_strip_extension(path_filename(file));

        // If a specific example was requested, skip the others.
        if g_example_filter >= 0 && leading_number(name) != g_example_filter  continue;
        ran_any = true;

        print("\n--- example: % ---\n", name);

        if !compile_one(name, file, EXAMPLES_OUT_DIR, dev)  continue;

        result := run_command(tprint("%/%", EXAMPLES_OUT_DIR, name));
        if result.exit_code != 0 {
            print("[fail] % exited with code %\n", name, result.exit_code);
        }
    }

    if g_example_filter >= 0 && !ran_any {
        print("No example with number % found in '%/'.\n", g_example_filter, EXAMPLES_DIR);
    }
}

// -1 means "all examples"; otherwise the example number to build/run.
g_example_filter := -1;

// Returns the first bare integer argument, or -1 if there isn't one.
find_number_arg :: (args: [] string) -> int {
    for args {
        value, ok := to_integer(it);
        if ok  return value;
    }
    return -1;
}

// Extracts the leading digits of a name, e.g. "03_arrays" -> 3. -1 if none.
leading_number :: (name: string) -> int {
    count := 0;
    while count < name.count && is_digit(name[count])  count += 1;
    if count == 0  return -1;
    value, ok := to_integer(slice(name, 0, count));
    return ifx ok then value else -1;
}

// ---- Shared compile step ---------------------------------------------------

compile_one :: (name: string, entry_file: string, output_dir: string, dev: bool) -> ok: bool {
    start := seconds_since_init();

    make_directory_if_it_does_not_exist(output_dir, recursive = true);

    w := compiler_create_workspace(name);
    if !w {
        print("Could not create workspace for '%'.\n", name);
        return false;
    }

    target := get_build_options(w);
    target.output_type            = .EXECUTABLE;
    target.output_executable_name = name;
    target.output_path            = output_dir;
    set_optimization(*target, ifx dev then Optimization_Type.DEBUG else .OPTIMIZED);
    set_build_options(target, w);

    compiler_begin_intercept(w);
    add_build_file(entry_file, w);

    ok := true;
    while true {
        message := compiler_wait_for_message();
        if message.kind == {
            case .ERROR;
                ok = false;
            case .COMPLETE;
                done := cast(*Message_Complete) message;
                if done.error_code != .NONE  ok = false;
                break;
        }
    }
    compiler_end_intercept(w);

    elapsed := seconds_since_init() - start;
    if ok  print("[ok]   built %/% in %s\n", output_dir, name, formatFloat(elapsed, trailing_width = 2));
    else   print("[fail] build failed for '%'\n", name);
    return ok;
}

// ---- Watch loop ------------------------------------------------------------

run_watch_loop :: (dir: string, rebuild: (dev: bool), dev: bool) {
    watcher: Watcher.File_Watcher();
    if !Watcher.init(*watcher, on_file_change, events_to_watch = .MODIFIED | .ADDED | .REMOVED | .MOVED) {
        print("Could not start file watcher.\n");
        return;
    }
    if !Watcher.add_directories(*watcher, dir) {
        print("Could not watch '%'.\n", dir);
        return;
    }

    print("\nWatching '%/' for changes. Press Ctrl-C to stop.\n", dir);

    while true {
        Watcher.process_changes(*watcher);
        if dirty {
            dirty = false;
            print("\n-- change detected, rebuilding --\n");
            rebuild(dev);
            print("\nWatching '%/' for changes. Press Ctrl-C to stop.\n", dir);
        }
        sleep_milliseconds(100);
    }
}

dirty := false;

on_file_change :: (watcher: *Watcher.File_Watcher(), change: *Watcher.File_Change, user_data: *void) {
    dirty = true;
}

// ---- Small helpers ---------------------------------------------------------

array_find :: (arr: [] string, value: string) -> bool {
    for arr  if it == value  return true;
    return false;
}

#run build();
