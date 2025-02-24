import React from 'react';
import UserHeader from "../containers/Header/UserHeader";
import Footer from "./Footer";
import './About.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const About = () => {
  const stats = [
    { icon: "users", value: "10K+", label: "Khách hàng" },
    { icon: "shopping-cart", value: "50K+", label: "Đơn hàng" },
    { icon: "star", value: "4.9", label: "Đánh giá" },
    { icon: "headset", value: "24/7", label: "Hỗ trợ" }
  ];

  const values = [
    {
      icon: "shield-alt",
      title: "An toàn & Bảo mật",
      description: "Cam kết bảo vệ thông tin và giao dịch của khách hàng với công nghệ bảo mật tiên tiến."
    },
    {
      icon: "gem",
      title: "Chất lượng Premium",
      description: "Cung cấp các tài khoản premium chính hãng với trải nghiệm tốt nhất cho người dùng."
    },
    {
      icon: "bolt",
      title: "Tốc độ & Hiệu quả",
      description: "Kích hoạt tài khoản tức thì, hỗ trợ khách hàng nhanh chóng và hiệu quả."
    }
  ];

  const team = [
    {
      name: "Nguyễn Mạnh Đạt",
      role: "Founder & CEO",
      image: require('../assets/entrepreneur-1.jpg'),
    },
    {
      name: "Trần Thị B",
      role: "Technical Director",
      image: require('../assets/entrepreneur-2.jpg'),
    },
    {
      name: "Lê Văn C",
      role: "Customer Success Manager",
      image: require('../assets/entrepreneur-3.jpg'),
    }
  ];

  return (
    <>
      <UserHeader />
      <div className="about-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Về Chúng Tôi</h1>
            <p className="subtitle">Đồng hành cùng bạn trên hành trình số hóa</p>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <FontAwesomeIcon icon={["fas", stat.icon]} />
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="story-section">
          <div className="story-content">
            <h2>Câu Chuyện Của Chúng Tôi</h2>
            <p>Octopus được thành lập với sứ mệnh đem đến cho người dùng Việt Nam những trải nghiệm premium tốt nhất từ các nền tảng số hàng đầu thế giới. Chúng tôi không ngừng nỗ lực để trở thành đối tác tin cậy trong hành trình số hóa của mọi người.</p>
            <div className="mission-vision">
              <div className="mission">
                <h3>Sứ mệnh</h3>
                <p>Mang đến giải pháp số hóa toàn diện và đáng tin cậy cho người dùng Việt Nam</p>
              </div>
              <div className="vision">
                <h3>Tầm nhìn</h3>
                <p>Trở thành nền tảng cung cấp tài khoản premium số 1 tại Việt Nam</p>
              </div>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2>Giá Trị Cốt Lõi</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <FontAwesomeIcon icon={["fas", value.icon]} />
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <h2>Đội Ngũ Của Chúng Tôi</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;