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
        version = "2.16.0";
        src = {
          "x86_64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-x64";
            sha256 = "sha256-FF/j+5tvm4oCDVmDdpIK5kdcMTuXwOHmkfY3eq2TCu8=";
          };
          "aarch64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-arm64";
            sha256 = "sha256-BbLGhYZo+2dqzK5ignvoOGpMYBITeP6aoo4MPMY8v1c=";
          };
          "x86_64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-x64";
            sha256 = "sha256-7wCmtofeD9j3iMJ7+Pese2Vy/BwqV2zdhZABX1JJMtc=";
          };
          "aarch64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-arm64";
            sha256 = "sha256-gu2WALeqlvCCeqymtGpAFRBvlsDGah2OhA6X1IhrODY=";
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
