const EARTH_RADIUS_KM = 6371;
const EARTH_ROTATION_HOURS = 23.9345;

const nasaFacts = {
  sun: { horizonsId: '10', meanRadiusKm: 695700, axialTiltDeg: 7.25, rotationPeriodHours: 609.12, semiMajorAxisAu: 0 },
  mercury: { horizonsId: '199', meanRadiusKm: 2439.7, axialTiltDeg: 0.034, rotationPeriodHours: 1407.6, semiMajorAxisAu: 0.3871 },
  venus: { horizonsId: '299', meanRadiusKm: 6051.8, axialTiltDeg: 177.4, rotationPeriodHours: -5832.5, semiMajorAxisAu: 0.7233 },
  earth: { horizonsId: '399', meanRadiusKm: 6371, axialTiltDeg: 23.44, rotationPeriodHours: 23.9345, semiMajorAxisAu: 1 },
  mars: { horizonsId: '499', meanRadiusKm: 3389.5, axialTiltDeg: 25.19, rotationPeriodHours: 24.6229, semiMajorAxisAu: 1.5237 },
  jupiter: { horizonsId: '599', meanRadiusKm: 69911, axialTiltDeg: 3.13, rotationPeriodHours: 9.925, semiMajorAxisAu: 5.2028 },
  saturn: { horizonsId: '699', meanRadiusKm: 58232, axialTiltDeg: 26.73, rotationPeriodHours: 10.656, semiMajorAxisAu: 9.5388 },
  uranus: { horizonsId: '799', meanRadiusKm: 25362, axialTiltDeg: 97.77, rotationPeriodHours: -17.24, semiMajorAxisAu: 19.1914 },
  neptune: { horizonsId: '899', meanRadiusKm: 24622, axialTiltDeg: 28.32, rotationPeriodHours: 16.11, semiMajorAxisAu: 30.0611 },
};

const visualRadiusFromNasa = (planetId) => {
  const earthRelativeRadius = nasaFacts[planetId].meanRadiusKm / EARTH_RADIUS_KM;
  return Number((0.78 * Math.pow(earthRelativeRadius, 0.34)).toFixed(2));
};

const rotationSpeedFromNasa = (planetId) => {
  const periodHours = nasaFacts[planetId].rotationPeriodHours;
  const direction = Math.sign(periodHours) || 1;
  const relativeSpeed = EARTH_ROTATION_HOURS / Math.abs(periodHours);
  return Number((direction * Math.max(0.06, Math.min(1.9, relativeSpeed))).toFixed(3));
};

const withNasaMotion = (planet) => ({
  ...planet,
  nasa: nasaFacts[planet.id],
  radius: visualRadiusFromNasa(planet.id),
  rotationSpeed: rotationSpeedFromNasa(planet.id),
});

const planetProfiles = [
  {
    id: 'mercury',
    name: 'Sao Thủy',
    tagline: 'Hành tinh nhỏ và gần Mặt Trời nhất',
    texture: '/planets/mercury.jpg',
    radius: 0.42,
    orbit: 4.2,
    realisticOrbit: 4.2,
    cinematicOrbit: 5,
    rotationSpeed: 1.1,
    orbitSpeed: 0.72,
    diameter: '4.879 km',
    day: '58,6 ngày Trái Đất',
    year: '88 ngày Trái Đất',
    distance: '57,9 triệu km',
    temperature: '-173 đến 427 C',
    description:
      'Sao Thủy là hành tinh nhỏ nhất và nằm gần Mặt Trời nhất. Bề mặt của nó có rất nhiều miệng hố và dấu vết va chạm.',
    facts: ['Gần Mặt Trời nhất', 'Không có mặt trăng', 'Nhiệt độ thay đổi cực lớn'],
  },
  {
    id: 'venus',
    name: 'Sao Kim',
    tagline: 'Hành tinh nóng nhất với lớp mây dày đặc',
    texture: '/venus/map.jpg',
    radius: 0.72,
    orbit: 6.1,
    realisticOrbit: 7.2,
    cinematicOrbit: 6.8,
    rotationSpeed: 0.45,
    orbitSpeed: 0.5,
    diameter: '12.104 km',
    day: '243 ngày Trái Đất',
    year: '225 ngày Trái Đất',
    distance: '108,2 triệu km',
    temperature: 'Khoảng 464 C',
    description:
      'Sao Kim có kích thước gần giống Trái Đất nhưng bị bao phủ bởi khí quyển dày, tạo hiệu ứng nhà kính rất mạnh.',
    facts: ['Nóng nhất hệ Mặt Trời', 'Quay ngược chiều', 'Mây axit sulfuric dày đặc'],
  },
  {
    id: 'earth',
    name: 'Trái Đất',
    tagline: 'Hành tinh xanh có sự sống',
    texture: '/earth/map.jpg',
    clouds: '/earth/clouds.jpg',
    radius: 0.78,
    orbit: 8.3,
    realisticOrbit: 10,
    cinematicOrbit: 8.6,
    rotationSpeed: 1,
    orbitSpeed: 0.38,
    diameter: '12.742 km',
    day: '23,9 giờ',
    year: '365,25 ngày',
    distance: '149,6 triệu km',
    temperature: 'Trung bình 15 C',
    description:
      'Trái Đất là hành tinh duy nhất mà chúng ta biết có đại dương, khí quyển phù hợp và sự sống.',
    facts: ['Có một Mặt Trăng', 'Có nước dạng lỏng', 'Có sự sống'],
  },
  {
    id: 'mars',
    name: 'Sao Hỏa',
    tagline: 'Hành tinh đỏ với núi lửa và thung lũng cổ xưa',
    texture: '/planets/mars.jpg',
    radius: 0.58,
    orbit: 10.6,
    realisticOrbit: 15.2,
    cinematicOrbit: 10.8,
    rotationSpeed: 0.96,
    orbitSpeed: 0.31,
    diameter: '6.779 km',
    day: '24,6 giờ',
    year: '687 ngày Trái Đất',
    distance: '227,9 triệu km',
    temperature: 'Trung bình -63 C',
    description:
      'Sao Hỏa là hành tinh đá lạnh với bụi đỏ, băng ở cực và dấu vết của những dòng sông cổ xưa.',
    facts: ['Có hai mặt trăng nhỏ', 'Có núi Olympus Mons', 'Từng có dấu vết nước'],
  },
  {
    id: 'jupiter',
    name: 'Sao Mộc',
    tagline: 'Người khổng lồ của hệ Mặt Trời',
    texture: '/planets/jupiter.jpg',
    radius: 1.45,
    orbit: 14,
    realisticOrbit: 26,
    cinematicOrbit: 14.4,
    rotationSpeed: 1.7,
    orbitSpeed: 0.18,
    diameter: '139.820 km',
    day: '9,9 giờ',
    year: '11,9 năm Trái Đất',
    distance: '778,5 triệu km',
    temperature: 'Đỉnh mây khoảng -110 C',
    description:
      'Sao Mộc là hành tinh lớn nhất. Khí quyển của nó có các dải mây, bão lớn và Vết Đỏ Lớn nổi tiếng.',
    facts: ['Lớn nhất hệ Mặt Trời', 'Có nhiều mặt trăng', 'Có Vết Đỏ Lớn'],
  },
  {
    id: 'saturn',
    name: 'Sao Thổ',
    tagline: 'Hành tinh có vành đai rực rỡ',
    texture: '/planets/saturn.jpg',
    rings: '/planets/saturn-ring.png',
    radius: 1.22,
    orbit: 17.9,
    realisticOrbit: 34,
    cinematicOrbit: 18.2,
    rotationSpeed: 1.45,
    orbitSpeed: 0.13,
    diameter: '116.460 km',
    day: '10,7 giờ',
    year: '29,5 năm Trái Đất',
    distance: '1,43 tỷ km',
    temperature: 'Đỉnh mây khoảng -140 C',
    description:
      'Sao Thổ nổi tiếng với hệ vành đai bằng băng và đá nhỏ bao quanh, tạo nên hình ảnh rất đặc biệt.',
    facts: ['Có vành đai đẹp nhất', 'Mật độ thấp', 'Titan có khí quyển dày'],
  },
  {
    id: 'uranus',
    name: 'Sao Thiên Vương',
    tagline: 'Hành tinh băng khổng lồ bị nghiêng trục',
    texture: '/planets/uranus.jpg',
    radius: 0.98,
    orbit: 21.4,
    realisticOrbit: 43,
    cinematicOrbit: 21.6,
    rotationSpeed: 1.08,
    orbitSpeed: 0.09,
    diameter: '50.724 km',
    day: '17,2 giờ',
    year: '84 năm Trái Đất',
    distance: '2,87 tỷ km',
    temperature: 'Khoảng -195 C',
    description:
      'Sao Thiên Vương có màu xanh nhạt do methane và trục quay nghiêng rất lớn, như đang lăn quanh Mặt Trời.',
    facts: ['Quay nghiêng gần ngang', 'Là hành tinh băng', 'Có vành mờ'],
  },
  {
    id: 'neptune',
    name: 'Sao Hải Vương',
    tagline: 'Hành tinh xanh xa xôi và nhiều gió mạnh',
    texture: '/planets/neptune.jpg',
    radius: 0.96,
    orbit: 24.7,
    realisticOrbit: 52,
    cinematicOrbit: 24.8,
    rotationSpeed: 1.12,
    orbitSpeed: 0.07,
    diameter: '49.244 km',
    day: '16,1 giờ',
    year: '165 năm Trái Đất',
    distance: '4,5 tỷ km',
    temperature: 'Khoảng -200 C',
    description:
      'Sao Hải Vương là hành tinh xa nhất trong 8 hành tinh chính, có màu xanh đậm và gió rất mạnh.',
    facts: ['Gió rất mạnh', 'Là hành tinh băng', 'Triton quay ngược chiều'],
  },
];

export const sunProfile = {
  id: 'sun',
  name: 'Mặt Trời',
  tagline: 'Ngôi sao trung tâm nuôi dưỡng toàn bộ Hệ Mặt Trời',
  texture: '/planets/sun.jpg',
  radius: 2.15,
  orbit: 0,
  realisticOrbit: 0,
  cinematicOrbit: 0,
  rotationSpeed: 0.12,
  orbitSpeed: 0,
  diameter: '1.392.700 km',
  day: 'Khoảng 25 - 35 ngày Trái Đất',
  year: 'Trung tâm Hệ Mặt Trời',
  distance: '0 km',
  temperature: 'Bề mặt khoảng 5.500 C',
  description:
    'Mặt Trời là ngôi sao ở trung tâm Hệ Mặt Trời. Năng lượng của nó tạo ánh sáng, nhiệt và ảnh hưởng đến khí hậu, quỹ đạo cũng như sự sống trên Trái Đất.',
  facts: ['Ngôi sao trung tâm', 'Chiếm hơn 99,8% khối lượng Hệ Mặt Trời', 'Tạo gió Mặt Trời'],
  nasa: nasaFacts.sun,
};

export const planets = planetProfiles.map(withNasaMotion);

export const planetMap = {
  sun: sunProfile,
  ...Object.fromEntries(planets.map((planet) => [planet.id, planet])),
};



