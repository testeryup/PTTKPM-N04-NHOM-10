import { useState } from 'react';
import UserHeader from '../UserHeader';
import './Support.scss';

const Support = () => {
    const [activeTab, setActiveTab] = useState('faq');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: 'Làm thế nào để mua sản phẩm?',
            answer: 'Bạn có thể dễ dàng mua sản phẩm bằng cách chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Đảm bảo bạn đã đăng nhập vào tài khoản trước khi mua hàng.'
        },
        {
            id: 2,
            question: 'Làm sao để nạp tiền vào tài khoản?',
            answer: 'Hiện tại, chúng tôi hỗ trợ nạp tiền qua ngân hàng và ví điện tử. Vui lòng truy cập mục "Nạp tiền" trong trang cá nhân để biết thêm chi tiết.'
        },
        {
            id: 3,
            question: 'Tôi có thể hoàn tiền không?',
            answer: 'Chúng tôi có chính sách hoàn tiền trong vòng 24h nếu sản phẩm gặp vấn đề. Vui lòng liên hệ với bộ phận hỗ trợ để được giúp đỡ.'
        }
    ];

    const contactInfo = {
        email: 'support@octopus.com',
        phone: '1900 1234',
        workingHours: '8:00 - 22:00 (Thứ 2 - Chủ nhật)'
    };

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    return (
        <>
            <UserHeader />
            <div className="support-container">
                <div className="support-content">
                    <div className="support-header">
                        <h1>Trung tâm hỗ trợ</h1>
                        <p>Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
                    </div>

                    <div className="support-tabs">
                        <button
                            className={`tab ${activeTab === 'faq' ? 'active' : ''}`}
                            onClick={() => setActiveTab('faq')}
                        >
                            <i className="fas fa-question-circle"></i>
                            Câu hỏi thường gặp
                        </button>
                        <button
                            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <i className="fas fa-headset"></i>
                            Liên hệ hỗ trợ
                        </button>
                    </div>

                    <div className="support-body">
                        {activeTab === 'faq' ? (
                            <div className="faq-section">
                                {faqs.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className={`faq-item ${expandedFaq === faq.id ? 'expanded' : ''}`}
                                        onClick={() => toggleFaq(faq.id)}
                                    >
                                        <div className="faq-question">
                                            <span>{faq.question}</span>
                                            <i className={`fas fa-chevron-${expandedFaq === faq.id ? 'up' : 'down'}`}></i>
                                        </div>
                                        <div className="faq-answer">
                                            {faq.answer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="contact-section">
                                <div className="contact-card">
                                    <div className="contact-info">
                                        <h3>Thông tin liên hệ</h3>
                                        <div className="info-item">
                                            <i className="fas fa-envelope"></i>
                                            <div>
                                                <label>Email</label>
                                                <p>{contactInfo.email}</p>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <i className="fas fa-phone-alt"></i>
                                            <div>
                                                <label>Hotline</label>
                                                <p>{contactInfo.phone}</p>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <i className="fas fa-clock"></i>
                                            <div>
                                                <label>Giờ làm việc</label>
                                                <p>{contactInfo.workingHours}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Support;