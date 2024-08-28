var nodes = [];
var isDrawing = false;
var startNode = null;
var currentLine = null;

function setup() {
  console.log("hello world");
  createCornerButton("ADD NODE", addNode);
  createCornerButton("ADD CONNECTION", addConnec);
}

const addNode = () => {
  document.removeEventListener('click', handleConnec);
  document.addEventListener('click', handleNode);
};

const addConnec = () => {
  document.removeEventListener('click', handleNode);
  document.addEventListener('click', handleConnec);
};

const handleNode = (event) => {
  const { pageX, pageY } = event;
  if (nodes.every(node => Math.hypot(pageX - node.x, pageY - node.y) >= 100)) {
    const circle = document.createElement('div');
    circle.className = 'node';
    circle.style.left = `${pageX - 10}px`;
    circle.style.top = `${pageY - 10}px`;
    document.body.appendChild(circle);

    nodes.push({ x: pageX, y: pageY, element: circle });
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
      const startX = startNode.x;
      const startY = startNode.y;
      const endX = endNode.x;
      const endY = endNode.y;

      currentLine.style.width = `${Math.hypot(endX - startX, endY - startY)}px`;
      currentLine.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
      currentLine.style.left = `${startX}px`;
      currentLine.style.top = `${startY}px`;

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

setup();
