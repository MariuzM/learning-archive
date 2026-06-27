const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const zap = b.dependency("zap", .{
        .target = target,
        .optimize = optimize,
    });

    const exe = b.addExecutable(.{
        .name = "zigserver",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    exe.root_module.addImport("zap", zap.module("zap"));
    // The shared image lives outside the Zig package, so wire it in as an
    // anonymous import that @embedFile can reach.
    exe.root_module.addAnonymousImport("sample_jpg", .{
        .root_source_file = b.path("../assets/sample.jpg"),
    });
    exe.root_module.addAnonymousImport("content_json", .{
        .root_source_file = b.path("../assets/content.json"),
    });
    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());
    const run_step = b.step("run", "Run the server");
    run_step.dependOn(&run_cmd.step);
}
