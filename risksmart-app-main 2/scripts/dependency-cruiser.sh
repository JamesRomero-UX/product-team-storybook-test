#!/bin/bash

# Script to run dependency cruiser on a given path
# Usage: ./scripts/dependency-cruiser.sh --path <path> [--filename <filename>] [--format <format>] [--focus-depth <depth>]

# Output colours
cyan='\033[0;36m'
green='\033[0;32m'
red='\033[0;31m'
reset='\033[0m'

# Function to show usage
show_usage() {
    echo "Usage: $0 --path <path> [options]"
    echo ""
    echo -e "Required arguments:"
    echo -e "${green}  --path, -p          Path to analyse (file or directory)"
    echo ""
    echo -e "${reset}Optional arguments:"
    echo -e "${cyan}  --filename, -f      Custom output filename (without extension)"
    echo -e "${cyan}  --format, -t        Output format: 'dot' (default), 'ddot', 'archi'"
    echo -e "${cyan}  --focus-depth, -d   Depth of dependency analysis (default: 3, 0 for infinte)"
    echo -e "${cyan}  --help, -h          Show this help message"
    echo ""
    echo -e "${reset}Examples:"
    echo "  $0 --path packages/web/src/components/FormBuilder.tsx"
    echo "  $0 -p packages/web -f custom-analysis -t archi -d 2"
    echo "  $0 --path src/utils --format ddot --focus-depth 4"
}

# Function to show animated loading
show_loading_animation() {
    local message="$1"
    local frames=("⣾" "⣽" "⣻" "⢿" "⡿" "⣟" "⣯" "⣷")
    local delay=0.2

    while true; do
        for frame in "${frames[@]}"; do
            printf "\r${cyan}%s ${reset}%s Analysing dependencies..." "$message" "$frame"
            sleep $delay
        done
    done
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    echo ""
    echo -e "${red}Error: ${reset}Please provide a path argument"
    echo ""
    show_usage
    exit 1
fi

# Check if GraphViz package is installed globally
if ! command -v dot &> /dev/null; then
    echo -e "${red}Error: ${reset}GraphViz is not installed. The 'dot' command is required for dependency visualization."
    echo "Please install GraphViz using Homebrew:"
    echo "  brew install graphviz"
    echo ""
    echo "After installation, try running the script again."
    exit 1
fi

# Initialize variables with defaults
PATH_ARG=""
FILENAME=""
FOCUS_DEPTH=3
FORMAT="dot"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --path|-p)
            PATH_ARG="$2"
            shift 2
            ;;
        --filename|-f)
            RAW_FILENAME="$2"
            # Apply filename transformation
            if [[ "$RAW_FILENAME" == *.* ]]; then
                # Has extension - extract it and process the rest
                BASE="${RAW_FILENAME%.*}"
                EXT="${RAW_FILENAME##*.}"
                # Replace slashes with dashes, dots with underscores, and remove leading ./ if present
                CLEAN_BASE=$(echo "$BASE" | sed 's|/|-|g' | sed 's|\.|_|g' | sed 's|^_||')
                FILENAME="${CLEAN_BASE}_${EXT}"
            else
                # No extension - just replace slashes and dots
                FILENAME=$(echo "$RAW_FILENAME" | sed 's|/|-|g' | sed 's|\.|_|g' | sed 's|^_||')
            fi
            shift 2
            ;;
        --format|-t)
            if [[ "$2" == "dot" ]] || [[ "$2" == "ddot" ]] || [[ "$2" == "archi" ]]; then
                FORMAT="$2"
            else
                echo -e "${red}Error: ${reset}Format must be 'dot', 'ddot' or 'archi'. Provided: '$2'"
                echo ""
                show_usage
                exit 1
            fi
            shift 2
            ;;
        --focus-depth|-d)
            if [[ "$2" =~ ^[0-9]+$ ]]; then
                FOCUS_DEPTH="$2"
            else
                echo -e "${red}Error: ${reset}Focus depth must be a number. Provided: '$2'"
                echo ""
                show_usage
                exit 1
            fi
            shift 2
            ;;
        --help|-h)
            echo ""
            show_usage
            exit 0
            ;;
        *)
            echo -e "${red}Error: ${reset}Unknown argument '$1'"
            echo ""
            show_usage
            exit 1
            ;;
    esac
done

# Check if required path argument is provided
if [ -z "$PATH_ARG" ]; then
    echo -e "${red}Error: ${reset}Path argument is required"
    echo ""
    show_usage
    exit 1
fi

# Generate filename if not provided
if [ -z "$FILENAME" ]; then
    # Replace slashes with underscores, dots with dashes, handle file extension separately
    # Extract the file extension if it exists
    if [[ "$PATH_ARG" == *.* ]]; then
        # Has extension - extract it and process the rest
        BASE="${PATH_ARG%.*}"
        EXT="${PATH_ARG##*.}"
        # Replace slashes with underscores, dots with dashes, and remove leading ./ if present
        CLEAN_BASE=$(echo "$BASE" | sed 's|/|-|g' | sed 's|\.|_|g' | sed 's|^_||')
        FILENAME="${CLEAN_BASE}_${EXT}"
    else
        # No extension - just replace slashes and dots
        FILENAME=$(echo "$PATH_ARG" | sed 's|/|-|g' | sed 's|\.|_|g' | sed 's|^_||')
    fi
fi

# Ensure the .dependency-cruiser directory exists
mkdir -p ./.dependency-cruiser

# Run the dependency cruiser command with pnpm
echo ""
echo -e "${cyan}🚢 Cruising dependencies for: ${reset}$PATH_ARG"
echo ""
echo -e "${cyan}📊 Format: ${reset}$FORMAT, ${cyan}🔍 Focus depth: ${reset}$FOCUS_DEPTH"
echo ""

# Start the loading animation in the background
echo -e "${cyan}🌊 Setting sail..."
echo ""
show_loading_animation "" & LOADING_PID=$!

# Run dependency cruiser and capture exit code
pnpm exec depcruise -x "(node_modules|@cloudscape-design|@risk-smart)" --focus "$PATH_ARG" --focus-depth "$FOCUS_DEPTH" --config ./.dependency-cruiser.cjs -T "$FORMAT" "$PATH_ARG" | dot -T svg | pnpm exec depcruise-wrap-stream-in-html > "./.dependency-cruiser/${FILENAME}.html" 2>/dev/null
EXIT_CODE=$?

# Stop the loading animation
kill $LOADING_PID 2>/dev/null
wait $LOADING_PID 2>/dev/null

# Clear the animation line
printf "\r\033[K"

# Show completion status
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${green}Analysis complete!${reset}"
    echo ""
    echo -e "${cyan}Dependency cruiser report generated: ${reset}./.dependency-cruiser/${FILENAME}.html"

    # Open the generated HTML file in the default browser
    REPORT_PATH="./.dependency-cruiser/${FILENAME}.html"
    echo ""
    echo -e "${reset}Opening report in browser..."

    # Cross-platform browser opening
    if command -v open &> /dev/null; then
        # macOS
        open "$REPORT_PATH"
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open "$REPORT_PATH"
    elif command -v start &> /dev/null; then
        # Windows (Git Bash/WSL)
        start "$REPORT_PATH"
    else
        echo -e "${orange}Could not automatically open browser. Please open: ${reset}$REPORT_PATH"
    fi
else
    echo -e "${red}❌ Analysis failed with exit code $EXIT_CODE${reset}"
    exit $EXIT_CODE
fi
