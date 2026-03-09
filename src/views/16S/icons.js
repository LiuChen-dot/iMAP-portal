// 16S 分析模块图标映射（scriptsId -> 本地图片）
import img1 from '@/assets/images/16s/1.png'
import img2 from '@/assets/images/16s/2.png'
import img3 from '@/assets/images/16s/3.png'
import img4 from '@/assets/images/16s/4.png'
import img5 from '@/assets/images/16s/5.png'
import img6 from '@/assets/images/16s/6.png'
import img7 from '@/assets/images/16s/7.png'
import img8 from '@/assets/images/16s/8.png'
import img9 from '@/assets/images/16s/9.png'
import img10 from '@/assets/images/16s/10.png'
import img11 from '@/assets/images/16s/11.png'
import img12 from '@/assets/images/16s/12.png'
import img13 from '@/assets/images/16s/13.png'
import img14 from '@/assets/images/16s/14.png'
import img15 from '@/assets/images/16s/15.png'
import img16 from '@/assets/images/16s/16.png'
import img17 from '@/assets/images/16s/17.png'
import img18 from '@/assets/images/16s/18.png'
import img19 from '@/assets/images/16s/19.png'
import img20 from '@/assets/images/16s/20.png'
import img21 from '@/assets/images/16s/21.png'
import img22 from '@/assets/images/16s/22.png'
import img23 from '@/assets/images/16s/23.jpg'
import img24 from '@/assets/images/16s/24.png'
import img26 from '@/assets/images/16s/26.png'
import imgDefault from '@/assets/images/16s/default.png'

export const iconMap = {
  1: img1, 2: img2, 3: img3, 4: img4, 5: img5, 6: img6, 7: img7, 8: img8,
  9: img9, 10: img10, 11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  16: img16, 17: img17, 18: img18, 19: img19, 20: img20,
  21: img21, 22: img22, 23: img23, 24: img24, 26: img26,
}

export function getIcon(scriptsId) {
  return iconMap[scriptsId] || imgDefault
}
