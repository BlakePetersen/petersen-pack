#!/bin/bash

# Check image counts in legacy site galleries

for gallery in animals animals-and-people boudoir fantasy headshots lifestyle-portraiture lifestylebranding rescuetales travel underwater yogadance; do
  count=$(curl -s "https://www.ashleypetersenphoto.com/$gallery/" | grep -o 'data-src="[^"]*"' | wc -l)
  echo "$gallery: $count images"
done
