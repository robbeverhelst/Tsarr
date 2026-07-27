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
        version = "2.12.1";
        src = {
          "x86_64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-x64";
            sha256 = "sha256-cTFupmR0pQfLq+nCsjEj8GQ+xkb3h6YRCHptoXHc9io=";
          };
          "aarch64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-arm64";
            sha256 = "sha256-l0dDL4tFoqQKv9pwxsbmC8nEsJLtAKJvl3rRkHqv5sc=";
          };
          "x86_64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-x64";
            sha256 = "sha256-WqTNCTEJxcZf2kcGapD8PWtCwkTYc3FvZPD63GxsiDk=";
          };
          "aarch64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-arm64";
            sha256 = "sha256-i6z9Od/F2E9PWmjnJ2G94Lgb5ltV9oBvuxpfCX69G/8=";
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
