import { describe, it, expect, vi, beforeEach } from "vitest";
import { pushCommand, imageInfoCommand, patchCommand } from "../vscdc";
import { push } from "../src/push";
import * as patch from "../src/patch";
import { generateImageInformationFiles } from "../src/image-info";

vi.mock("../src/push", () => ({
  push: vi.fn(),
}));

vi.mock("../src/patch", () => ({
  patch: vi.fn(),
  patchAll: vi.fn(),
}));

vi.mock("../src/image-info", () => ({
  generateImageInformationFiles: vi.fn(),
}));

vi.mock("../src/utils/config", () => ({
  getConfig: vi.fn((key, defaultValue) => defaultValue),
}));

vi.mock("path", () => ({
  default: {
    resolve: vi.fn((...args) => args.join("/")), // Simplified for testing
  },
}));

describe("vscdc CLI Commands", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("pushCommand", () => {
    it("should call push with correct arguments", async () => {
      const argv = {
        githubRepo: "test-repo",
        release: "v1.0.0",
        updateLatest: true,
        registry: "test-registry.io",
        registryPath: "test-path",
        stubRegistry: "stub-registry.io",
        stubRegistryPath: "stub-path",
        push: true,
        prepOnly: false,
        skip: [],
        page: 1,
        pageTotal: 1,
        replaceImages: false,
        devcontainer: "my-devcontainer",
        secondaryRegistryPath: "secondary-path",
      };

      await pushCommand(argv);

      expect(push).toHaveBeenCalledWith(
        argv.githubRepo,
        argv.release,
        argv.updateLatest,
        argv.registry,
        argv.registryPath,
        argv.stubRegistry,
        argv.stubRegistryPath,
        argv.push,
        argv.prepOnly,
        argv.skip,
        argv.page,
        argv.pageTotal,
        argv.replaceImages,
        argv.devcontainer,
        argv.secondaryRegistryPath,
      );
    });
  });

  describe("imageInfoCommand", () => {
    it("should call generateImageInformationFiles with correct arguments", async () => {
      const argv = {
        githubRepo: "test-repo",
        release: "main",
        registry: "test-registry.io",
        registryPath: "test-path",
        stubRegistry: "stub-registry.io",
        stubRegistryPath: "stub-path",
        build: true,
        prune: false,
        cg: true,
        markdown: false,
        overwrite: true,
        outputPath: "output/path",
        devcontainer: "my-devcontainer",
      };

      await imageInfoCommand(argv);

      expect(generateImageInformationFiles).toHaveBeenCalledWith(
        argv.githubRepo,
        argv.release,
        argv.registry,
        argv.registryPath,
        argv.stubRegistry,
        argv.stubRegistryPath,
        argv.build,
        argv.prune,
        argv.cg,
        argv.markdown,
        argv.overwrite,
        expect.stringContaining("output/path"), // path.resolve is mocked
        argv.devcontainer,
      );
    });
  });

  describe("patchCommand", () => {
    it("should call patchAll when argv.all is true", async () => {
      const argv = {
        all: true,
        registry: "test-registry.io",
        registryPath: "test-path",
      };

      await patchCommand(argv);

      expect(patch.patchAll).toHaveBeenCalledWith(
        argv.registry,
        argv.registryPath,
      );
      expect(patch.patch).not.toHaveBeenCalled();
    });

    it("should call patch when argv.all is false", async () => {
      const argv = {
        all: false,
        patchPath: "my-patch-path",
        registry: "test-registry.io",
        registryPath: "test-path",
      };

      await patchCommand(argv);

      expect(patch.patch).toHaveBeenCalledWith(
        argv.patchPath,
        argv.registry,
        argv.registryPath,
      );
      expect(patch.patchAll).not.toHaveBeenCalled();
    });
  });
});
