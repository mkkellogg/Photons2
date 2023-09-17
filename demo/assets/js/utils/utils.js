export const convertRadToDeg = (degrees) => {
    return degrees * ((Math.PI * 2) / 360);
};

export const calculateMeshYPositionOnFloor = (mesh, floor) => {
    return floor.position.y + mesh.geometry.parameters.height / 2;
};
