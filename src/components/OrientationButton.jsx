const OrientationButton = ({ orientation, setOrientation }) => {
  return (
    <button onClick={() => setOrientation(orientation === 'v' ? 'h' : 'v')}>
      change boat orientation
    </button>
  );
};
export default OrientationButton;