#!/usr/bin/env bash
#
# Download club crests from MLS's own CDN, then install them.
#
#   bash scripts/fetch-logos.sh            # download + install
#   bash scripts/fetch-logos.sh --keep     # also keep the raw downloads
#
# This runs on YOUR machine and fetches from images.mlssoccer.com, the same
# CDN that serves mlssoccer.com/clubs. The URLs below were read off that page.
#
# WHAT THIS DOES NOT GET YOU
# These are the web crests: PNG, one colourway, sized for a website. They are
# fine for a deck. They are NOT the sanctioned brand package -- no vector, no
# mono or reversed variants, no gradient variant, and no league crest. For
# those, use the official logo pack linked from MLS's media resources page:
#
#   https://www.mlssoccer.com/media-resources/   ->  "Logos"
#   https://mlssoccer.box.com/s/lggk1zb5ea4vu7lo7zv7y2qztqtcmd8g
#
# Download that, unzip it, and run:  npm run logos -- <unzipped-folder>
# It will overwrite anything this script installed with the proper assets.
#
# These are trademarks. Use them internally; do not republish them.

set -euo pipefail
cd "$(dirname "$0")/.."

OUT="${TMPDIR:-/tmp}/mls-crests-$$"
mkdir -p "$OUT"
KEEP=0
[ "${1:-}" = "--keep" ] && KEEP=1

# Swap t_club_logo_medium for a wider Cloudinary transform to get a bigger
# file. w_1024 usually works on this CDN; if a download comes back tiny or
# empty, set BIG=0 and re-run to use the exact URLs the site serves.
BIG="${BIG:-1}"
tx() { if [ "$BIG" = "1" ]; then echo "${1/t_club_logo_medium/w_1024,c_fit,f_png}"; else echo "$1"; fi; }

B="https://images.mlssoccer.com/image/upload/t_club_logo_medium"
declare -A URL=(
  [atl]="$B/v1775849066/assets/mnp/Club_Logo-Atlanta_ugeyc3_hw47tg.png"
  [atx]="$B/v1747499975/assets/logos/mls-clubs/Club_Logo-Austin_pa9xtu.png"
  [clt]="$B/v1747500045/assets/logos/mls-clubs/Club_Logo-Charlotte_p7sznf.png"
  [chi]="$B/v1747500178/assets/logos/mls-clubs/Club_Logo-Chicago_jm2yev.png"
  [cin]="$B/v1747500249/assets/logos/mls-clubs/Club_Logo-Cincinnati_jwgkps.png"
  [col]="$B/v1747500322/assets/logos/mls-clubs/Club_Logo-Colorado_n5kpss.png"
  [clb]="$B/v1747500414/assets/logos/mls-clubs/Club_Logo-Columbus_light_z3eq8l.png"
  [dc]="$B/v1747500504/assets/logos/mls-clubs/Club_Logo-D.C_t03ekm.png"
  [dal]="$B/v1747500567/assets/logos/mls-clubs/Club_Logo-Dallas_sysmtj.png"
  [hou]="$B/v1747500939/assets/logos/mls-clubs/Club_Logo-Houston_oifm77.png"
  [skc]="$B/v1747754918/assets/logos/mls-clubs/Club_Logo-Kansas_City_cnhd75.png"
  [la]="$B/v1747755165/assets/logos/mls-clubs/Club_Logo-LA_Galaxy_fg0wjp.png"
  [lafc]="$B/v1747755309/assets/logos/mls-clubs/Club_Logo-LAFC_djrhru.png"
  [mia]="$B/v1747755405/assets/logos/mls-clubs/Club_Logo-Miami_tyqe64.png"
  [min]="$B/v1747754826/assets/logos/mls-clubs/Club_Logo-Minnesota_ftweor.png"
  [mtl]="$B/v1747755806/assets/logos/mls-clubs/Club_Logo-Montreal_beeqnh.png"
  [nsh]="$B/v1747755999/assets/logos/mls-clubs/Club_Logo-Nashville_rb9vwu.png"
  [ne]="$B/v1766020750/assets/NE_Logo_PRI_FC_RGB_480x480_fdx2us.png"
  [rbny]="$B/v1779382319/assets/logos/mls-clubs/RBNY_Logo_v7jpkq.png"
  [nyc]="$B/v1747756306/assets/logos/mls-clubs/Club_Logo-New_York_City_xu6vax.png"
  [orl]="$B/v1747769281/assets/logos/mls-clubs/Club_Logo-Orlando_ryyn7a.png"
  [phi]="$B/v1747769446/assets/logos/mls-clubs/Club_Logo-Philadelphia_im7pqg.png"
  [por]="$B/v1747769540/assets/logos/mls-clubs/Club_Logo-Portland_qihpaz.png"
  [rsl]="$B/v1747776403/assets/logos/mls-clubs/Club_Logo-Salt_Lake_City_hpvde5.png"
  [sd]="$B/v1748261519/assets/logos/mls-clubs/Club_Logo-San_Diego_nwpyul.png"
  [sj]="$B/v1748262048/assets/logos/mls-clubs/Club_Logo-San_Jose_opzlmo.png"
  [sea]="$B/v1748265125/assets/logos/mls-clubs/Club_Logo-Seattle_e6jk2x.png"
  [stl]="$B/v1747771858/assets/logos/mls-clubs/Club_Logo-Saint_Louis_guz12c.png"
  [tor]="$B/v1748265251/assets/logos/mls-clubs/Club_Logo-Toronto_vz6hao.png"
  [van]="$B/v1748265547/assets/logos/mls-clubs/Club_Logo-Vancouver_ao9phl.png"
)

echo "Downloading ${#URL[@]} club crests to $OUT"
ok=0; bad=0
for slug in "${!URL[@]}"; do
  u="$(tx "${URL[$slug]}")"
  if curl -fsSL --retry 2 --max-time 30 -o "$OUT/$slug.png" "$u" && [ -s "$OUT/$slug.png" ]; then
    printf '  %-5s ok\n' "$slug"; ok=$((ok+1))
  else
    printf '  %-5s FAILED\n' "$slug"; rm -f "$OUT/$slug.png"; bad=$((bad+1))
  fi
done

echo
echo "$ok downloaded, $bad failed"
[ "$bad" -gt 0 ] && echo "If many failed, re-run with BIG=0 to use the exact URLs the site serves."
echo

node scripts/install-logos.mjs "$OUT" --force

if [ "$KEEP" = "1" ]; then
  echo "Raw downloads kept in $OUT"
else
  rm -rf "$OUT"
fi

cat <<'NOTE'

The league crest is NOT in this set -- it is not on the clubs page. Get it,
plus vector and the mono / reversed / gradient variants, from the official
pack: https://www.mlssoccer.com/media-resources/ -> "Logos"
Then: npm run logos -- <unzipped-folder>
NOTE
