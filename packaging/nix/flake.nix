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
        version = "2.4.10";
        src = {
          "x86_64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-x64";
            sha256 = "sha256-XKrzEC6E5Lh3e6VxVeWc0GKM55iVcy+UMozlNu2HDQs=";
          };
          "aarch64-linux" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-linux-arm64";
            sha256 = "sha256-OL5KwFrP4fRB/pa985y2smSab1E9NcU8Bmr0H+g70PQ=";
          };
          "x86_64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-x64";
            sha256 = "sha256-DXvsfilBaeODGKUjZJs0QI0JLpmhcjV2XMP8kOlsQLo=";
          };
          "aarch64-darwin" = pkgs.fetchurl {
            url = "https://github.com/robbeverhelst/tsarr/releases/download/v${version}/tsarr-darwin-arm64";
            sha256 = "sha256-vlLLlBjScEDMYeZLshNnn2A6xF/ZkSAaUZv6ifTMcgc=";
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
