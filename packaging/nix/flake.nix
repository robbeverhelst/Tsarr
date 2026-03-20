{
  description = "Type-safe TypeScript SDK and CLI for Servarr APIs";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        version = "2.4.12";
        src = {
          "x86_64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-x64";
            sha256 = "sha256-NzxlXsghrmbmhC9XInfezgMJHcJYretjuFb43Z8JqUA=";
          };
          "aarch64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-arm64";
            sha256 = "sha256-VAWGBmuqZtF2wgL3XKRJobZCeZC0zUaQfNx39K5NeLE=";
          };
          "x86_64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-x64";
            sha256 = "sha256-M5D+zwMVznVZSNXaqG+TjE/A87jQ9OKfBbGUKYIgQnc=";
          };
          "aarch64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-arm64";
            sha256 = "sha256-qGjks0LmyDeW6LDiIAPp1lM8nr1kRyGLRj6th2ItDcE=";
          };
        };
      in
      {
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "tsarr";
          inherit version;
          src = src.${system};
          dontUnpack = true;
          installPhase = ''
            mkdir -p $out/bin
            cp $src $out/bin/tsarr
            chmod +x $out/bin/tsarr
          '';
        };
      }
    );
}
