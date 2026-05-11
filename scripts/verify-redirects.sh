#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://shopify-eight-lemon.vercel.app}"

echo "Verifying redirects against $BASE"
echo "================================================"

check_redirect() {
  local path="$1"
  local expected_status="$2"
  local expected_location="${3:-}"

  local response
  response=$(curl -sI "$BASE$path")
  local status
  status=$(echo "$response" | grep -i "^HTTP/" | awk '{print $2}' | tr -d '\r')
  local location
  location=$(echo "$response" | grep -i "^location:" | awk '{print $2}' | tr -d '\r')

  if [[ "$status" == "$expected_status" ]]; then
    if [[ -z "$expected_location" || "$location" == "$expected_location" ]]; then
      echo "OK  $path  ->  $status $location"
      return 0
    else
      echo "FAIL $path  ->  $status (location: $location, expected: $expected_location)"
      return 1
    fi
  else
    echo "FAIL $path  ->  $status (expected $expected_status)"
    return 1
  fi
}

echo ""
echo "--- Spot-check explicit product redirects ---"
check_redirect "/product/12v-self-priming-garden-caravan-electric-water-pump-faucet-tap-kit-5m-pipe" "308" "/pumps-and-tanks/pumps"
check_redirect "/product/rimless-watermark-back-to-wall-toilet-soft-close-wels" "308" "/plumbing/toilets"
check_redirect "/product/100l-chemical-dosing-tank-water-tank-poly-tank-and-bund" "308" "/pumps-and-tanks/dosing-tanks"
check_redirect "/product/uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-12vdc" "308" "/water-filters/uv-sterilisation"
check_redirect "/product/hot-cold-water-cooler-direct-connect" "308" "/bubblers-and-coolers/coolers-and-chillers"

echo ""
echo "--- Bathroom subtree ---"
check_redirect "/bathroom/product/toilet-rimless-modern-watermark-ceramic-p-trap-commode-modern-2piece-toilet-wels" "308" "/plumbing/toilets"

echo ""
echo "--- Product categories ---"
check_redirect "/product-category/water-filters" "308" "/water-filters"
check_redirect "/product-category/filter-cartridges" "308" "/cartridges"
check_redirect "/product-category/whole-house" "308" "/water-filters/whole-house"
check_redirect "/product-category/water-filters/page/3" "308" "/water-filters"

echo ""
echo "--- Utility pages ---"
check_redirect "/our-contacts" "308" "/about"
check_redirect "/delivery-return" "308" "/shipping"
check_redirect "/whole-house-water-filter-australia" "308" "/use/whole-home-filtration"
check_redirect "/shop" "308" "/water-filters"

echo ""
echo "--- Fallbacks (unmapped /product/) ---"
check_redirect "/product/some-random-unmapped-product-slug" "308" "/water-filters"
check_redirect "/cart" "308" "/water-filters"

echo ""
echo "--- 410 Gone responses ---"
check_redirect "/author/admin" "410"
check_redirect "/wp-admin/anything" "410"
check_redirect "/colour/brushed-gold" "410"
check_redirect "/2024/10" "410"
check_redirect "/bathroom/elements/banner" "410"

echo ""
echo "--- Canonical destinations return 200 ---"
check_redirect "/water-filters" "200"
check_redirect "/plumbing/toilets" "200"
check_redirect "/pumps-and-tanks/pumps" "200"
check_redirect "/cartridges" "200"
check_redirect "/about" "200"

echo ""
echo "--- Trailing-slash variants ---"
check_redirect "/our-contacts/" "308" "/about"
check_redirect "/product-category/water-filters/" "308" "/water-filters"

echo ""
echo "Verification complete."
