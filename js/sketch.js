var nodes = [];
var connections = [];
var isDrawing = false;
var startNode = null;
var currentLine = null;
var walkModeActive = false;
var currentWalkNode = null;
var walkInterval = null;
var walkIntervalTime = 500; // Default walk interval time (in milliseconds)

const PADDING_TOP = 20;
const PADDING_BOTTOM = 20;

let minHeight = 0;
let maxHeight = window.innerHeight;

const NORMAL_COLOR = 'rgb(81, 211, 223)';
const SELECTED_COLOR = 'rgb(255, 199, 43)';

const BAR_WIDTH = 40; // Updated bar width
const BAR_SPACING = 5;
const GRAPH_HEIGHT = 100;
const GRAPH_WIDTH = 800;

const NODE_SIZE = 40; // Size of the node
const TEXT_COLOR = 'rgba(0, 0, 0, 0)'; // Text color (transparent)

function setup() {
  createCornerButton("ADD NODE", addNode);
  createCornerButton("ADD CONNECTION", addConnec);
  createCornerButton("START WALK", startWalk);

  // Create the bar graph container
  createBarGraph();

  // Create the speed control slider
  createSpeedSlider();

  // Update height limits based on elements
  updateHeightLimits();
}

const createBarGraph = () => {
  const graphContainer = document.createElement('div');
  graphContainer.id = 'bar-graph';
  graphContainer.style.position = 'fixed';
  graphContainer.style.bottom = '10px'; // Moved up by 50px
  graphContainer.style.left = '20px';
  graphContainer.style.background = 'transparent'; // No background
  graphContainer.style.overflow = 'hidden'; // No scrollbar
  graphContainer.style.height = '300px';
  document.body.appendChild(graphContainer);

  // Update graph container width to the right side of the 'start_walk' element
  updateGraphContainerWidth();
};

const updateGraphContainerWidth = () => {
  const startWalkElement = document.getElementById('start_walk');
  if (!startWalkElement) return;

  const startWalkRect = startWalkElement.getBoundingClientRect();
  const graphContainer = document.getElementById('bar-graph');
  if (graphContainer) {
    graphContainer.style.width = `${startWalkRect.left - 20}px`; // 20px away from the left edge
  }
};

const updateBarGraph = () => {
  const graphContainer = document.getElementById('bar-graph');
  if (!graphContainer) return;

  // Clear the previous bars
  graphContainer.innerHTML = '';
  graphContainer.style.position = 'absolute'; // Ensure the container is positioned relatively

  const totalVisits = nodes.reduce((total, node) => total + node.visitCount, 0);

  nodes.forEach((node, index) => {
    // Calculate the percentage for the bar
    const percentage = totalVisits > 0 ? (node.visitCount / totalVisits * 100).toFixed(1) : 0;

    // Create the bar element
    const bar = document.createElement('div');
    bar.style.width = `${BAR_WIDTH}px`; // Adjusted bar width
    bar.style.height = `${(node.visitCount / Math.max(...nodes.map(n => n.visitCount))) * GRAPH_HEIGHT}px`;
    bar.style.backgroundColor = NORMAL_COLOR;
    bar.style.position = 'absolute';
    bar.style.bottom = '40px'; // Move the bar up by 20px from the bottom
    bar.style.left = `${index * (BAR_WIDTH + BAR_SPACING)}px`;
    bar.style.borderWidth = '0'; // Remove border
    bar.style.borderColor = 'transparent';
    bar.style.textAlign = 'center';
    bar.style.borderRadius = '5px'; // Rounded corners
    bar.style.color = '#000'; // Text color
    bar.style.display = 'flex';
    bar.style.alignItems = 'flex-end';
    bar.style.justifyContent = 'center';
    bar.style.fontSize = '14px'; // Font size for percentage text

    // Create the label element
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.width = `${BAR_WIDTH}px`; // Same width as the bar
    label.style.textAlign = 'center';
    label.style.bottom = '0'; // Place label at the bottom of the bar
    label.style.left = `${index * (BAR_WIDTH + BAR_SPACING)}px`;
    label.style.fontSize = '24px';
    label.textContent = node.id; // Display node ID

    // Append the percentage text to the bar
    const percentageText = document.createElement('div');
    percentageText.textContent = `${percentage}%`;
    bar.appendChild(percentageText);

    // Append bar and label to the container
    graphContainer.appendChild(bar);
    graphContainer.appendChild(label);
  });

  // Adjust container width to fit all bars
  const totalWidth = nodes.length * (BAR_WIDTH + BAR_SPACING) - BAR_SPACING; // Account for spacing
  graphContainer.style.width = `${Math.max(totalWidth, GRAPH_WIDTH)}px`; // Ensure at least GRAPH_WIDTH
};

const createSpeedSlider = () => {
  const sliderContainer = document.createElement('div');
  sliderContainer.id = 'slider-container';
  sliderContainer.style.position = 'fixed';
  sliderContainer.style.display = 'flex';
  sliderContainer.style.flexDirection = 'column';
  sliderContainer.style.alignItems = 'center';
  sliderContainer.style.transform = 'rotate(90deg)'; // Rotate to vertical orientation

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '50'; // Minimum interval time (100ms)
  slider.max = '1000'; // Maximum interval time (2000ms)
  slider.value = '500'; // Default value
  slider.step = '50'; // Step size
  slider.style.writingMode = 'bt-rl'; // Vertical slider
  slider.style.height = '50px';
  slider.style.width = "500px";
  slider.addEventListener('input', (event) => {
    // Reverse the scale: Higher value = shorter interval
    const maxInterval = parseInt(slider.max);
    const minInterval = parseInt(slider.min);
    const sliderValue = parseInt(event.target.value);
    walkIntervalTime = minInterval + (maxInterval - sliderValue);
    
    if (walkModeActive) {
      clearInterval(walkInterval);
      walkInterval = setInterval(updateWalkNode, walkIntervalTime);
    }
  });

  sliderContainer.appendChild(slider);
  document.body.appendChild(sliderContainer);
};


const addNode = () => {
  if (walkModeActive) {
    resetNodeColors();
    walkModeActive = false;
  }
  document.removeEventListener('click', handleConnec);
  document.addEventListener('click', handleNode);
};

const addConnec = () => {
  if (walkModeActive) {
    resetNodeColors();
    walkModeActive = false;
  }
  document.removeEventListener('click', handleNode);
  document.addEventListener('click', handleConnec);
};

const startWalk = () => {
  document.removeEventListener('click', handleNode);
  document.removeEventListener('click', handleConnec);
  document.addEventListener('click', handleWalk);
  walkModeActive = true;

  // Start walking to nodes
  if (walkInterval) clearInterval(walkInterval);
  walkInterval = setInterval(updateWalkNode, walkIntervalTime); // Use the slider's value
};

const updateHeightLimits = () => {
  const mainElement = document.getElementById('main');
  const addConnectionElement = document.getElementById('add_connection');

  if (mainElement) {
    minHeight = mainElement.getBoundingClientRect().bottom + PADDING_TOP;
  }

  if (addConnectionElement) {
    maxHeight = addConnectionElement.getBoundingClientRect().top - PADDING_BOTTOM;
  }
};

const handleNode = (event) => {
  const { pageX, pageY } = event;

  if (pageY >= minHeight && pageY <= maxHeight) {
    if (nodes.every(node => Math.hypot(pageX - node.x, pageY - node.y) >= 100)) {
      const circle = document.createElement('div');
      circle.className = 'node';
      circle.style.width = `${NODE_SIZE}px`; // Updated size
      circle.style.height = `${NODE_SIZE}px`; // Updated size
      circle.style.borderRadius = '50%'; // Ensure circular shape
      circle.style.left = `${pageX - NODE_SIZE / 2}px`; // Center the node
      circle.style.top = `${pageY - NODE_SIZE / 2}px`; // Center the node
      circle.style.backgroundColor = NORMAL_COLOR;
      circle.style.color = "#151515"; // Make text color transparent
      circle.style.display = 'flex'; // Use flexbox to center content
      circle.style.alignItems = 'center'; // Center vertically
      circle.style.justifyContent = 'center'; // Center horizontally
      circle.style.fontSize = '30px'; // Adjust font size as needed
      circle.style.textAlign = 'center'; // Ensure text is centered
      circle.style.lineHeight = `${NODE_SIZE}px`; // Ensure text is centered vertically

      // Number the node
      const nodeId = nodes.length + 1;
      circle.textContent = nodeId;

      document.body.appendChild(circle);

      nodes.push({ x: pageX, y: pageY, element: circle, id: nodeId, connections: [], visitCount: 0 });
      updateBarGraph(); // Update bar graph after adding a node
    }
  }
};

const handleConnec = (event) => {
  const { pageX, pageY } = event;
  const clickedNode = nodes.find(node => Math.hypot(pageX - node.x, pageY - node.y) < 20);
  
  if (clickedNode) {
    if (!isDrawing) {
      isDrawing = true;
      startNode = clickedNode;

      currentLine = document.createElement('div');
      currentLine.className = 'line';
      document.body.appendChild(currentLine);

      document.addEventListener('mousemove', updateLine);
    } else {
      isDrawing = false;
      document.removeEventListener('mousemove', updateLine);

      const endNode = clickedNode;

      // Check if the connection already exists
      const connectionExists = connections.some(conn =>
        (conn.start === startNode && conn.end === endNode) ||
        (conn.start === endNode && conn.end === startNode)
      );

      if (!connectionExists) {
        const startX = startNode.x;
        const startY = startNode.y;
        const endX = endNode.x;
        const endY = endNode.y;

        currentLine.style.width = `${Math.hypot(endX - startX, endY - startY)}px`;
        currentLine.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
        currentLine.style.left = `${startX}px`;
        currentLine.style.top = `${startY}px`;

        // Store the connection
        connections.push({ start: startNode, end: endNode });
        startNode.connections.push(endNode);
        endNode.connections.push(startNode);
      } else {
        // Remove the line if the connection already exists
        currentLine.remove();
      }

      currentLine = null;
      startNode = null;
    }
  }
};

const updateLine = (event) => {
  if (!currentLine || !startNode) return;

  const startX = startNode.x;
  const startY = startNode.y;
  const endX = event.pageX;
  const endY = event.pageY;

  currentLine.style.width = `${Math.hypot(endX - startX, endY - startY)}px`;
  currentLine.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
  currentLine.style.left = `${startX}px`;
  currentLine.style.top = `${startY}px`;
};

const handleWalk = (event) => {
  const { pageX, pageY } = event;
  const clickedNode = nodes.find(node => Math.hypot(pageX - node.x, pageY - node.y) < 20);

  if (clickedNode) {
    nodes.forEach(node => {
      node.element.style.backgroundColor = node === clickedNode ? SELECTED_COLOR : NORMAL_COLOR;
    });
    currentWalkNode = clickedNode;
  }
};

const updateWalkNode = () => {
  if (!walkModeActive || !currentWalkNode) return;

  const { connections } = currentWalkNode;
  if (connections.length === 0) return;

  // Increment visit count for the current node
  currentWalkNode.visitCount++;

  const randomIndex = Math.floor(Math.random() * connections.length);
  const nextNode = connections[randomIndex];

  nodes.forEach(node => {
    node.element.style.backgroundColor = node === nextNode ? SELECTED_COLOR : NORMAL_COLOR;
  });

  currentWalkNode = nextNode;
  updateBarGraph(); // Update bar graph during walking
};

const resetNodeColors = () => {
  nodes.forEach(node => {
    node.element.style.backgroundColor = NORMAL_COLOR;
  });
};

window.addEventListener('resize', updateHeightLimits); // Update limits on window resize
setup();
