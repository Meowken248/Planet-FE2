import React, { useEffect } from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';
import { planetShooterConfig } from '../missions/planetShooterConfig.js';
import SurfacePreview from '../ui/SurfacePreview.jsx';

const profileCodes = {
  sun: 'SN-00',
  mercury: 'MR-01',
  venus: 'VN-02',
  earth: 'ER-03',
  mars: 'MS-04',
  jupiter: 'JP-05',
  saturn: 'ST-06',
  uranus: 'UR-07',
  neptune: 'NP-08',
};

const goHome = () => {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4';

const planetReading = {
  sun: {
    source: 'NASA Science: Sun',
    url: 'https://science.nasa.gov/sun/',
    title: 'Mặt Trời: ngôi sao trung tâm và nguồn năng lượng của Hệ Mặt Trời',
    intro:
      'Mặt Trời là một ngôi sao ở trung tâm Hệ Mặt Trời. Nó giữ các hành tinh, tiểu hành tinh, sao chổi và bụi vũ trụ trong quỹ đạo nhờ lực hấp dẫn khổng lồ. Ánh sáng và nhiệt từ Mặt Trời giúp Trái Đất có khí hậu, đại dương và sự sống như chúng ta biết.',
    body: [
      'Mặt Trời chủ yếu gồm hydrogen và helium. Trong lõi của nó, phản ứng nhiệt hạch biến hydrogen thành helium và giải phóng năng lượng cực lớn. Năng lượng đó mất rất lâu để đi từ lõi ra bề mặt, rồi chỉ mất khoảng 8 phút để ánh sáng Mặt Trời đi tới Trái Đất. Nhìn từ xa, Mặt Trời có vẻ ổn định, nhưng thật ra nó luôn sôi động với plasma, từ trường, vết đen Mặt Trời, tai lửa và các vụ phun trào mạnh.',
      'NASA nghiên cứu Mặt Trời bằng nhiều nhiệm vụ như Parker Solar Probe, Solar Dynamics Observatory và SOHO. Những quan sát này giúp con người hiểu thời tiết không gian: gió Mặt Trời, bão từ và các dòng hạt năng lượng có thể ảnh hưởng đến vệ tinh, liên lạc vô tuyến, lưới điện và cả phi hành gia. Trong game, Mặt Trời nên là màn cực nóng: nền nhật hoa rực sáng, đạn plasma, quái sinh ra từ lửa sao và boss là một thực thể năng lượng trong vùng bùng phát.'
    ],
    highlights: ['Ngôi sao trung tâm', 'Ánh sáng tới Trái Đất khoảng 8 phút', 'Có gió Mặt Trời', 'Parker Solar Probe bay rất gần Mặt Trời'],
  },
  mercury: {
    source: 'NASA Science: Mercury',
    url: 'https://science.nasa.gov/mercury/',
    title: 'Sao Thủy: hành tinh nhỏ nhất nhưng nhanh nhất',
    intro:
      'Sao Thủy là hành tinh gần Mặt Trời nhất và cũng là hành tinh nhỏ nhất trong Hệ Mặt Trời. Nó chỉ lớn hơn Mặt Trăng của Trái Đất một chút, nhưng lại di chuyển cực nhanh quanh Mặt Trời: một năm trên Sao Thủy chỉ dài 88 ngày Trái Đất. Vì gần Mặt Trời và gần như không có khí quyển dày để giữ nhiệt, bề mặt Sao Thủy thay đổi nhiệt độ rất dữ dội giữa ngày và đêm.',
    body: [
      'Bề mặt Sao Thủy đầy miệng hố va chạm, giống một bản ghi cổ về những lần thiên thạch đâm xuống trong lịch sử Hệ Mặt Trời. Các vùng sáng và tối trên bề mặt cho thấy vật chất đá, khoáng chất và những mảng địa hình hình thành qua hàng tỷ năm. Dù nhìn đơn giản, Sao Thủy rất thú vị vì lõi kim loại của nó chiếm phần lớn kích thước hành tinh, khiến các nhà khoa học dùng nó để hiểu quá trình hình thành các hành tinh đá.',
      'NASA từng khám phá Sao Thủy bằng Mariner 10 và MESSENGER. MESSENGER bay ngang Sao Thủy nhiều lần rồi đi vào quỹ đạo, lập bản đồ bề mặt và giúp con người hiểu rõ hơn về từ trường, thành phần hóa học và lịch sử địa chất của hành tinh này. Trong game, Sao Thủy có thể được thiết kế như một màn tốc độ cao: nền nóng, ánh sáng gắt, quái nhanh, chướng ngại là đá nóng và tia năng lượng Mặt Trời.'
    ],
    highlights: ['Gần Mặt Trời nhất', 'Năm chỉ 88 ngày Trái Đất', 'Bề mặt nhiều miệng hố', 'Được MESSENGER lập bản đồ'],
  },
  venus: {
    source: 'NASA Science: Venus',
    url: 'https://science.nasa.gov/venus/',
    title: 'Sao Kim: thế giới mây độc và nhiệt độ cực hạn',
    intro:
      'Sao Kim là hành tinh thứ hai tính từ Mặt Trời và thường được gọi là láng giềng gần của Trái Đất. Kích thước của Sao Kim gần giống Trái Đất, nhưng môi trường lại hoàn toàn khác: nó bị bao phủ bởi lớp mây dày, khí quyển giàu carbon dioxide và nhiệt độ bề mặt đủ nóng để làm chảy chì.',
    body: [
      'Khí quyển Sao Kim tạo hiệu ứng nhà kính cực mạnh. Áp suất bề mặt cao, nhiệt độ nóng, và mây axit sulfuric khiến đây là một trong những nơi khắc nghiệt nhất trong Hệ Mặt Trời. Bề mặt Sao Kim không dễ quan sát bằng mắt thường từ quỹ đạo vì mây dày che phủ, nên các tàu như Magellan đã dùng radar để lập bản đồ địa hình, phát hiện núi lửa, đồng bằng dung nham và các cấu trúc va chạm.',
      'Sao Kim rất hợp để làm màn game dạng “acid sky”: tầm nhìn mờ, quái bay trong mây, đạn màu nhạt như axit và boss có thể là một sinh vật mây độc. Người chơi cần né các vùng khí nóng, các cụm mây độc và những đợt tấn công bất ngờ từ nền khí quyển dày.'
    ],
    highlights: ['Nóng nhất Hệ Mặt Trời', 'Mây axit sulfuric', 'Bề mặt bị mây che kín', 'Mariner 2 từng bay ngang năm 1962'],
  },
  earth: {
    source: 'NASA Science: Earth',
    url: 'https://science.nasa.gov/earth/',
    title: 'Trái Đất: hành tinh sống và hệ thống tự nhiên phức tạp',
    intro:
      'Trái Đất là ngôi nhà của chúng ta và là hành tinh duy nhất con người biết chắc có sự sống. NASA nghiên cứu Trái Đất bằng vệ tinh, máy bay, cảm biến và dữ liệu khoa học để hiểu đại dương, khí quyển, băng, đất liền, sinh vật và khí hậu liên kết với nhau như thế nào.',
    body: [
      'Trái Đất đặc biệt vì có nước lỏng ổn định trên bề mặt, khí quyển bảo vệ, từ trường giúp chắn một phần bức xạ Mặt Trời, và hệ sinh thái đa dạng. Đại dương điều hòa nhiệt, mây và khí quyển tạo thời tiết, còn băng ở cực lưu giữ dấu vết khí hậu cổ. Khi một phần của hệ thống thay đổi, ví dụ nhiệt độ đại dương hoặc băng tan, các phần khác cũng bị ảnh hưởng.',
      'Trong game, Trái Đất nên là màn bảo vệ quỹ đạo: người chơi chống rác vũ trụ, drone ô nhiễm và các mảnh va chạm để giữ hành tinh xanh an toàn. Đây cũng là màn phù hợp để giới thiệu ý nghĩa bảo vệ môi trường, vì dữ liệu NASA cho thấy quan sát Trái Đất giúp con người đưa ra quyết định tốt hơn cho đời sống và tương lai.'
    ],
    highlights: ['Có nước lỏng', 'Có sự sống', 'NASA theo dõi bằng hơn 20 vệ tinh', 'Hệ khí hậu liên kết chặt chẽ'],
  },
  mars: {
    source: 'NASA Science: Mars',
    url: 'https://science.nasa.gov/mars/',
    title: 'Sao Hỏa: hành tinh đỏ của robot và dấu vết nước cổ',
    intro:
      'Sao Hỏa là hành tinh thứ tư tính từ Mặt Trời. Nó khô, lạnh, nhiều đá và nổi bật trên bầu trời như một điểm sáng đỏ. NASA mô tả Sao Hỏa là hành tinh duy nhất mà chúng ta biết hiện đang được “cư trú” hoàn toàn bởi robot, vì nhiều tàu quỹ đạo, rover và lander đã đến đó để nghiên cứu.',
    body: [
      'Sao Hỏa có nhiều dấu hiệu cho thấy quá khứ từng ấm hơn, ẩm hơn và có khí quyển dày hơn hiện nay. Các rover như Perseverance và Curiosity nghiên cứu đá, khoáng chất và dấu vết môi trường cổ để tìm hiểu liệu Sao Hỏa từng có điều kiện phù hợp cho vi sinh vật hay không. Các tàu quỹ đạo như Mars Reconnaissance Orbiter tìm dấu hiệu nước từng tồn tại lâu dài trên bề mặt.',
      'Trong game, Sao Hỏa rất hợp với phong cách bão cát: tầm nhìn bị bụi đỏ che, quái là kẻ cướp bụi, boss là cỗ máy chiến tranh cổ. Nền màn chơi có thể có hẻm núi, đá đỏ và các trận gió ngang làm người chơi phải điều khiển phi thuyền chính xác hơn.'
    ],
    highlights: ['Hành tinh đỏ', 'Có robot đang hoạt động', 'Từng có môi trường ấm và ẩm hơn', 'Mục tiêu lớn cho thám hiểm tương lai'],
  },
  jupiter: {
    source: 'NASA Science: Jupiter',
    url: 'https://science.nasa.gov/jupiter/',
    title: 'Sao Mộc: vua hành tinh và cỗ máy bão khổng lồ',
    intro:
      'Sao Mộc là hành tinh thứ năm từ Mặt Trời và là hành tinh lớn nhất Hệ Mặt Trời. NASA cho biết nó nặng hơn gấp đôi tổng khối lượng của tất cả các hành tinh còn lại cộng lại. Nếu Sao Mộc là một vỏ rỗng, khoảng 1.000 Trái Đất có thể nằm bên trong.',
    body: [
      'Sao Mộc là một hành tinh khí khổng lồ với các dải mây, bão xoáy và từ trường cực mạnh. Vết Đỏ Lớn là một cơn bão nổi tiếng tồn tại rất lâu. Dù khổng lồ, Sao Mộc quay rất nhanh: một ngày chỉ khoảng 9,9 giờ, khiến khí quyển bị kéo thành những dải mây dài. Tàu Juno của NASA hiện đang nghiên cứu Sao Mộc từ quỹ đạo, còn Europa Clipper được phóng năm 2024 để nghiên cứu mặt trăng băng Europa.',
      'Trong game, Sao Mộc nên là màn bão điện: nền nhiều mây xoáy, quái tạo sét, đạn đổi hướng theo luồng gió và boss là Titan Bão Lớn. Người chơi có thể phải né các dòng điện, sóng áp suất và vùng nhiễu từ trường.'
    ],
    highlights: ['Lớn nhất Hệ Mặt Trời', 'Có ngày rất ngắn', 'Vết Đỏ Lớn nổi tiếng', 'Có 95 mặt trăng được công nhận'],
  },
  saturn: {
    source: 'NASA Science: Saturn',
    url: 'https://science.nasa.gov/saturn/',
    title: 'Sao Thổ: thế giới vành đai và những mặt trăng bí ẩn',
    intro:
      'Sao Thổ là hành tinh thứ sáu tính từ Mặt Trời và lớn thứ hai trong Hệ Mặt Trời. Nó nổi tiếng với hệ vành đai tuyệt đẹp, tạo bởi vô số mảnh băng và đá. Đây cũng là hành tinh xa nhất từng được con người biết đến bằng mắt thường từ thời cổ đại.',
    body: [
      'Sao Thổ chủ yếu gồm hydrogen và helium, giống Sao Mộc nhưng có diện mạo rất riêng nhờ vành đai sáng. NASA đã khám phá Sao Thổ bằng Pioneer 11, Voyager 1, Voyager 2 và đặc biệt là Cassini, tàu đi vào quỹ đạo năm 2004 và làm thay đổi hiểu biết của con người về hành tinh này. Sao Thổ có rất nhiều mặt trăng, từ Titan lớn hơn Sao Thủy đến Enceladus có đại dương ngầm dưới lớp băng.',
      'Trong game, Sao Thổ nên là màn “ring shard lane”: người chơi bay qua các mảnh băng và đá trong vành đai. Quái có thể ngụy trang thành mảnh vành đai, boss dùng vòng xoáy để khóa đường bay, tạo cảm giác vừa đẹp vừa nguy hiểm.'
    ],
    highlights: ['Có vành đai nổi bật', 'Khí khổng lồ hydrogen và helium', 'Cassini từng bay quanh Sao Thổ', 'Enceladus có đại dương ngầm'],
  },
  uranus: {
    source: 'NASA Science: Uranus',
    url: 'https://science.nasa.gov/uranus/',
    title: 'Sao Thiên Vương: hành tinh băng nghiêng gần như nằm ngang',
    intro:
      'Sao Thiên Vương là hành tinh thứ bảy từ Mặt Trời và là hành tinh lớn thứ ba trong Hệ Mặt Trời. NASA mô tả nó như một thế giới rất lạnh, nhiều gió, có vành đai mờ và hơn hai chục mặt trăng nhỏ. Điểm đặc biệt nhất là trục quay nghiêng gần 90 độ, khiến hành tinh như đang lăn quanh Mặt Trời.',
    body: [
      'Sao Thiên Vương thuộc nhóm hành tinh băng khổng lồ. Màu xanh nhạt đến xanh lục đến từ methane trong khí quyển hấp thụ ánh sáng đỏ. Vì trục nghiêng kỳ lạ, các mùa trên Sao Thiên Vương rất cực đoan: một cực có thể hướng về Mặt Trời trong thời gian dài, rồi chìm vào bóng tối nhiều năm. Voyager 2 là tàu duy nhất từng bay ngang Sao Thiên Vương vào năm 1986, phát hiện thêm mặt trăng, vành đai và dữ liệu về từ trường.',
      'Trong game, Sao Thiên Vương phù hợp với màn băng nghiêng: camera và đường bay có thể hơi lệch, đạn quái đi theo góc lạ, chướng ngại là tinh thể băng methane. Người chơi sẽ cảm giác như đang chiến đấu trong một quỹ đạo bị xoay nghiêng.'
    ],
    highlights: ['Nghiêng gần 90 độ', 'Hành tinh băng khổng lồ', 'Có vành mờ', 'Voyager 2 là tàu duy nhất từng bay ngang'],
  },
  neptune: {
    source: 'NASA Science: Neptune',
    url: 'https://science.nasa.gov/neptune/',
    title: 'Sao Hải Vương: thế giới xa xôi của gió siêu thanh',
    intro:
      'Sao Hải Vương là hành tinh thứ tám và xa nhất trong tám hành tinh chính. Nó tối, lạnh và bị quét bởi những luồng gió rất mạnh. NASA ghi nhận Sao Hải Vương là hành tinh đầu tiên được phát hiện bằng toán học trước khi được quan sát rõ ràng.',
    body: [
      'Sao Hải Vương nằm xa Mặt Trời hơn Trái Đất hơn 30 lần, nên không thể thấy bằng mắt thường. Màu xanh đậm của nó liên quan đến methane và các lớp khí quyển sâu. Voyager 2 là tàu duy nhất từng bay ngang Sao Hải Vương vào năm 1989, gửi về hình ảnh đầu tiên cận cảnh của hành tinh này. Mặt trăng lớn nhất của Sao Hải Vương là Triton, được phát hiện chỉ 17 ngày sau khi Sao Hải Vương được xác nhận.',
      'Trong game, Sao Hải Vương có thể là màn cuối lạnh và khó: nền tối xanh, gió mạnh làm đạn và vật thể bị kéo lệch, quái bơi trong bão sâu và boss đại diện cho cơn bão vực thẳm. Đây là nơi phù hợp để tăng độ căng thẳng, âm thanh trầm và hiệu ứng gió mạnh.'
    ],
    highlights: ['Xa nhất trong 8 hành tinh chính', 'Gió rất mạnh', 'Được phát hiện bằng toán học', 'Voyager 2 bay ngang năm 1989'],
  },
};

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  if (name === 'download') {
    return (
      <svg {...common}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
      </svg>
    );
  }

  if (name === 'sparkles') {
    return (
      <svg {...common}>
        <path d="M9.9 2.6 8.4 7.1 4 8.6l4.4 1.5 1.5 4.5 1.5-4.5 4.4-1.5-4.4-1.5z" />
        <path d="m18 13 1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
      </svg>
    );
  }

  if (name === 'wand') {
    return (
      <svg {...common}>
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9H6" />
        <path d="M20 9h-2" />
        <path d="m17.8 6.2 1.4-1.4" />
        <path d="m10.8 13.2-1.4 1.4" />
        <path d="m17.8 11.8 1.4 1.4" />
        <path d="m10.8 4.8-1.4-1.4" />
        <path d="m3 21 9-9" />
      </svg>
    );
  }

  if (name === 'book') {
    return (
      <svg {...common}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  if (name === 'menu') {
    return (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    );
  }

  if (name === 'arrow') {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 5 7 7-7 7" />
      </svg>
    );
  }

  if (name === 'plus') {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function PlanetProfilePage({ planetId, onHome }) {
  const planet = planetMap[planetId] || planetMap.earth;
  const shooter = planetShooterConfig[planet.id] || planetShooterConfig.earth;
  const missionData = shooter.mission || {};
  const reading = planetReading[planet.id] || planetReading.earth;
  const profileTheme = {
    '--planet-accent': shooter.accent,
    '--planet-glow': shooter.palette?.[0] || shooter.accent,
    '--planet-glow-2': shooter.palette?.[1] || shooter.bossColor,
    '--planet-glow-3': shooter.palette?.[2] || shooter.enemyColor,
    '--planet-boss': shooter.bossColor,
    '--planet-shot': shooter.shotColors?.boss || shooter.enemyColor,
  };
  const missionCards = [
    ['Mục tiêu', missionData.objective],
    ['Địa hình', shooter.terrain],
    ['Kẻ địch', shooter.enemyLabel],
    ['Boss', shooter.bossName],
    ['Điểm cần đạt', `${missionData.targetScore} điểm`],
    ['Thời gian', `${missionData.timeLimit}s`],
  ];
  const mission = useSolarStore((state) => state.mission);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);
  const openStoryBook = useSolarStore((state) => state.openStoryBook);
  const openQuiz = useSolarStore((state) => state.openQuiz);
  const openShooterMission = useSolarStore((state) => state.openShooterMission);
  const handleHome = onHome || goHome;

  useEffect(() => {
    selectPlanet(planet.id);
  }, [planet.id, selectPlanet]);

  const isMissionTarget = mission.status === 'scan' && mission.targetId === planet.id;
  const scanProgress = isMissionTarget ? 100 : mission.targetId === planet.id ? Math.round(mission.progress * 100) : 34;

  return (
    <main className={`planet-profile-page ${planet.id}`} style={profileTheme}>
      <video className="profile-video-bg" src={heroVideo} autoPlay loop muted playsInline />
      <div className="profile-video-shade" />
      <div className="profile-aurora" />
      <div className="profile-scan-beam" />
      <div className="profile-energy-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="profile-orbit-glow">
        <i />
        <i />
        <i />
      </div>
      <div className="profile-starfield">
        {Array.from({ length: 26 }, (_, index) => (
          <span
            key={index}
            style={{
              '--i': index,
              '--x': `${(index * 37) % 100}%`,
              '--y': `${(index * 19) % 100}%`,
              '--s': `${1 + (index % 3)}px`,
            }}
          />
        ))}
      </div>

      <section className="planet-profile-hero">
        <div className="profile-left-panel">
          <div className="liquid-glass-strong profile-panel-glass" />

          <nav className="profile-nav">
            <button type="button" className="profile-brand" onClick={handleHome}>
              <span className={`planet-orb ${planet.id}`} />
              <strong>PLANET</strong>
            </button>
            <button type="button" className="profile-menu-btn liquid-glass" onClick={handleHome}>
              <Icon name="back" />
              Hệ hành tinh
            </button>
          </nav>

          <div className="profile-hero-copy">
            <span className={`profile-hero-orb planet-orb ${planet.id}`} />
            <div className="profile-floating-chips" aria-hidden="true">
              <span>{planet.diameter}</span>
              <span>{planet.day}</span>
              <span>{shooter.terrain}</span>
            </div>
            
            <h1>
              Khám phá <em>{planet.name}</em> qua nhiệm vụ không gian
            </h1>
            <p>{planet.description}</p>
            <button type="button" className="profile-primary-cta liquid-glass-strong" onClick={openShooterMission}>
              Khám phá nhiệm vụ ngay
             
            </button>

            <div className="profile-secondary-actions">
              <button type="button" className="liquid-glass" onClick={openStoryBook}>
                <Icon name="book" />
                Kể chuyện
              </button>
              <button type="button" className="liquid-glass" onClick={openQuiz}>
                <Icon name="sparkles" />
                Thử thách
              </button>
            </div>

            <div className="profile-pill-row">
              <span className="liquid-glass">Hành tinh 3D</span>
              <span className="liquid-glass">Game bắn ngang</span>
              <span className="liquid-glass">Dữ liệu NASA</span>
            </div>
          </div>

          <div className="profile-quote">
            <span>VISIONARY ORBIT</span>
            <p>Chúng ta không chỉ nhìn một hành tinh. <em>Chúng ta bước vào câu chuyện của nó.</em></p>
            <strong><i /> SOLARVERSE MISSION <i /></strong>
          </div>
        </div>

        <aside className="profile-right-panel">
          <div className="profile-social-row">

            <button type="button" className="profile-icon-btn liquid-glass" aria-label="Mission AI">
              <Icon name="sparkles" />
            </button>
          </div>

          <div className="profile-community-card liquid-glass">
            <strong>{shooter.title}</strong>
            <p>{shooter.subtitle}</p>
          </div>

          <div className="planet-profile-visual">
            <div className="profile-visual-rings" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <SurfacePreview planet={planet} />
          </div>

          <div className="profile-feature-dock liquid-glass-strong">
            <div className="profile-mini-grid">
              <div className="profile-mini-card liquid-glass">
                <span className="profile-icon-circle"><Icon name="wand" /></span>
                <strong>Processing</strong>
                <p>{scanProgress}% phân tích dữ liệu quỹ đạo.</p>
              </div>
              <div className="profile-mini-card liquid-glass">
                <span className="profile-icon-circle"><Icon name="book" /></span>
                <strong>Growth Archive</strong>
                <p>{planet.facts[0]} / {planet.facts[1]}</p>
              </div>
            </div>

            <div className="profile-game-card liquid-glass">
              <div className="profile-game-thumb">
                <img src={shooter.background} alt="" />
              </div>
              <div>
                <strong>{shooter.bossName}</strong>
                <p>
                  Nhiệm vụ {shooter.terrain}: hạ {shooter.enemyLabel}, sống sót {missionData.timeLimit}s,
                  mục tiêu {missionData.targetKills} quái và {missionData.targetScore} điểm.
                </p>
              </div>
              <button type="button" onClick={openShooterMission} aria-label="Mở nhiệm vụ">
                <Icon name="plus" />
              </button>
            </div>
          </div>
        </aside>

        <article className="profile-data-panel liquid-glass-strong">
          <div className="profile-section-title">Dữ liệu hành tinh</div>
          <dl className="planet-stats profile-stats">
            <div>
              <dt>Đường kính</dt>
              <dd>{planet.diameter}</dd>
            </div>
            <div>
              <dt>Bán kính NASA</dt>
              <dd>{planet.nasa.meanRadiusKm.toLocaleString('vi-VN')} km</dd>
            </div>
            <div>
              <dt>Ngày</dt>
              <dd>{planet.day}</dd>
            </div>
            <div>
              <dt>Nghiêng trục</dt>
              <dd>{planet.nasa.axialTiltDeg.toLocaleString('vi-VN')}°</dd>
            </div>
            <div>
              <dt>Năm</dt>
              <dd>{planet.year}</dd>
            </div>
            <div>
              <dt>Khoảng cách</dt>
              <dd>{planet.distance}</dd>
            </div>
            <div>
              <dt>Nhiệt độ</dt>
              <dd>{planet.temperature}</dd>
            </div>
          </dl>

          <div className="profile-section-title">Dấu hiệu nổi bật</div>
          <div className="fact-row profile-facts">
            {planet.facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>

          <div className="info-actions">
            <button type="button" className="action-btn mission-game-btn" onClick={openShooterMission}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 16c-1 2-2 3-4 4 1-3 1-5 3-7" />
                <path d="M9 15 4 10l5-2 5-5 7 7-5 5-2 5z" />
                <path d="m15 9-6 6" />
              </svg>
              Hoàn thành nhiệm vụ
            </button>
            <button type="button" className="action-btn story-btn" onClick={openStoryBook}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Kể chuyện
            </button>
            <button type="button" className="action-btn quiz-btn" onClick={openQuiz}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Thử thách
            </button>
            </div>
        </article>
      </section>

      <section className="planet-mission-briefing">
        <div className="mission-briefing-shell liquid-glass-strong">
          <div className="mission-briefing-copy">
            <span>Mission Briefing</span>
            <h2>{shooter.title}</h2>
            <p>
              {shooter.subtitle}. Màn chơi của {planet.name} dùng màu đạn, quái và boss theo đúng khí chất
              của hành tinh này để mỗi lần bước sang một thế giới mới đều có cảm giác khác nhau.
            </p>
            <button type="button" className="profile-primary-cta liquid-glass-strong" onClick={openShooterMission}>
              Bắt đầu chiến đấu
              <span><Icon name="arrow" /></span>
            </button>
          </div>

          <div className="mission-briefing-grid">
            {missionCards.map(([label, value], index) => (
              <div className="mission-briefing-card liquid-glass" key={label} style={{ '--card-index': index }}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="mission-weapon-strip">
            <span style={{ background: shooter.shotColors?.scout }} />
            <span style={{ background: shooter.shotColors?.scoutAlt }} />
            <span style={{ background: shooter.shotColors?.blade }} />
            <span style={{ background: shooter.shotColors?.heavy }} />
            <span style={{ background: shooter.shotColors?.boss }} />
          </div>
        </div>
      </section>

      <section className="planet-reading-section">
        <div className="planet-reading-shell liquid-glass-strong">
          <div className="planet-reading-heading">
            <span>Đọc thêm về hành tinh</span>
            <h2>{reading.title}</h2>
            <p>{reading.intro}</p>
          </div>

          <div className="planet-reading-grid">
            <article className="planet-reading-copy">
              {reading.body.map((paragraph) => (
                <p className="profile-scroll-reveal" key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <aside className="planet-reading-facts liquid-glass">
              <strong>Điểm cần nhớ</strong>
              {reading.highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
              <a href={reading.url} target="_blank" rel="noreferrer">
                Nguồn: {reading.source}
              </a>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
