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
        version = "2.14.0";
        src = {
          "x86_64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-x64";
            sha256 = "sha256-I3ETKJXGwWR3HRSinmBK1Zo+BZVc3vslpvQ/+kwlgjw=";
          };
          "aarch64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-arm64";
            sha256 = "sha256-0dIq0Zw9PtRYvvA9vTso+0LKEkfazwSiMOZdrXCXkUY=";
          };
          "x86_64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-x64";
            sha256 = "sha256-KFS7Gu0QQPgLnC7oGnILXgRzrrLOy+rCJaQrmA+7eSU=";
          };
          "aarch64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-arm64";
            sha256 = "sha256-yrG+3Jr49n4xYYdOPcVBsVDOmAmubncY4iKssjEViZY=";
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
