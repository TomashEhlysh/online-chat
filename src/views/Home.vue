<template>
    <div class="wrapper">
        <section class="carusel">
            <div class="container-fluid">
                <swiper
                    :slides-per-view="1"
                    :space-between="50"
                    @swiper="onSwiper"
                    @slideChange="onSlideChange"
                    class="carusel-slider"
                >
                    <swiper-slide class="slider-item">Slide 1</swiper-slide>
                    <swiper-slide class="slider-item">Slide 2</swiper-slide>
                    <swiper-slide class="slider-item">Slide 3</swiper-slide>
                </swiper>
            </div>
        </section>
        <section class="about">
            <div class="container">
                <h2 class="about-title title">
                    About us
                </h2>
                <ul class="about-list">
                    <li class="about-item">
                        <i class="pi pi-bolt about-item_icon"></i>
                        <h3 class="about-item_title subtitle">
                            About1
                        </h3>
                        <p class="about-item_description description">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet laborum natus corrupti cum nobis aut eveniet, veniam aspernatur harum voluptate ducimus? Ullam vero saepe velit autem doloribus veritatis quam perspiciatis.
                        </p>
                    </li>
                    <li class="about-item">
                        <i class="pi pi-bolt about-item_icon"></i>
                        <h3 class="about-item_title subtitle">
                            About2
                        </h3>
                        <p class="about-item_description description">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet laborum natus corrupti cum nobis aut eveniet, veniam aspernatur harum voluptate ducimus? Ullam vero saepe velit autem doloribus veritatis quam perspiciatis.
                        </p>
                    </li>
                    <li class="about-item">
                        <i class="pi pi-bolt about-item_icon"></i>
                        <h3 class="about-item_title subtitle">
                            About3
                        </h3>
                        <p class="about-item_description description">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet laborum natus corrupti cum nobis aut eveniet, veniam aspernatur harum voluptate ducimus? Ullam vero saepe velit autem doloribus veritatis quam perspiciatis.
                        </p>
                    </li>
                </ul>
            </div>
        </section>
        <section class="news">
            <div class="container">
                <h2 class="news-title title">
                    News
                </h2>
                <ul class="news-list">
                    <li class="news-item">
                        <router-link to="/">
                            <div class="news-item_img" style="background: #666"></div>
                            <h3 class="news-item_title subtitle">
                                News1
                            </h3>
                            <p class="news-item_description description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae aut? Nesciunt corrupti porro ratione debitis neque sed magni nostrum quas labore natus explicabo, accusantium recusandae. Minima saepe possimus sapiente?
                            </p>
                        </router-link>
                    </li>
                    <li class="news-item">
                        <router-link to="/">
                            <div class="news-item_img" style="background: #666"></div>
                            <h3 class="news-item_title subtitle">
                                News1
                            </h3>
                            <p class="news-item_description description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae aut? Nesciunt corrupti porro ratione debitis neque sed magni nostrum quas labore natus explicabo, accusantium recusandae. Minima saepe possimus sapiente?
                            </p>
                        </router-link>
                    </li>
                    <li class="news-item">
                        <router-link to="/">
                            <div class="news-item_img" style="background: #666"></div>
                            <h3 class="news-item_title subtitle">
                                News1
                            </h3>
                            <p class="news-item_description description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae aut? Nesciunt corrupti porro ratione debitis neque sed magni nostrum quas labore natus explicabo, accusantium recusandae. Minima saepe possimus sapiente?
                            </p>
                        </router-link>
                    </li>
                    <li class="news-item">
                        <router-link to="/">
                            <div class="news-item_img" style="background: #666"></div>
                            <h3 class="news-item_title subtitle">
                                News1
                            </h3>
                            <p class="news-item_description description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae aut? Nesciunt corrupti porro ratione debitis neque sed magni nostrum quas labore natus explicabo, accusantium recusandae. Minima saepe possimus sapiente?
                            </p>
                        </router-link>
                    </li>
                    <li class="news-item">
                        <router-link to="/">
                            <div class="news-item_img" style="background: #666"></div>
                            <h3 class="news-item_title subtitle">
                                News1
                            </h3>
                            <p class="news-item_description description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae aut? Nesciunt corrupti porro ratione debitis neque sed magni nostrum quas labore natus explicabo, accusantium recusandae. Minima saepe possimus sapiente?
                            </p>
                        </router-link>
                    </li>
                </ul>
            </div>
        </section>
    </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
export default {
    components: {
        Swiper, SwiperSlide
    },
}
</script>

<style>

</style>