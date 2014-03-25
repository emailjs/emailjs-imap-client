define(['chai', 'browserbox'], function(chai, BrowserBox) {
    'use strict';

    var expect = chai.expect;
    chai.Assertion.includeStack = true;

    describe('browserbox integration tests', function() {
        var imap;

        beforeEach(function(done) {
            imap = new BrowserBox('127.0.0.1', 10000, {
                auth: {
                    user: "testuser",
                    pass: "testpass"
                },
                useSSL: true,
                ca: '-----BEGIN CERTIFICATE-----\r\nMIICKTCCAZICCQDpQ20Tsi+iMDANBgkqhkiG9w0BAQUFADBZMQswCQYDVQQGEwJB\r\nVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0\r\ncyBQdHkgTHRkMRIwEAYDVQQDEwlsb2NhbGhvc3QwHhcNMTQwMzE3MTM1MzMxWhcN\r\nMTQwNDE2MTM1MzMxWjBZMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0\r\nZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRIwEAYDVQQDEwls\r\nb2NhbGhvc3QwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMD2N+TDbLNTJ9zX\r\nm8QLMYxlPbB8zg7mXKhsUf9nesY16vE8jCYPLGU4KrlwTz8rwU25o2b02RsQJJf1\r\nZHvLJRMbyRftwboeHDUgKwTlEpZr/u4gkhq7nXtDk3oDbMEzhgsIB7BBmF2/h9g0\r\nLPe+xO7IbOcPmkBHtsh8IdHqVuUFAgMBAAEwDQYJKoZIhvcNAQEFBQADgYEAbs6+\r\nswTx03uGJfihujLC7sUiTmv9rFOTiqgElhK0R3Pft4nbWL1Jhn4twUwCa+csCDEA\r\nroItaeKZAC5zUGA4uXn1R0dZdOdLOff7998zSY3V5/cMAUYFztqSJjvqllDXxAmF\r\n30HHOMhiXQI1Wm0pqKlgzGCBt0fObgSaob9Zqbs=\r\n-----END CERTIFICATE-----\r\n'
            });
            expect(imap).to.exist;

            imap.onauth = done;
            imap.onerror = done;
            imap.connect();
        });

        afterEach(function(done) {
            imap.onclose = done;
            imap.close();
        });

        describe('#listMailboxes', function() {
            it('should succeed', function(done) {
                imap.listMailboxes(function(err, mailboxes) {
                    expect(err).to.not.exist;
                    expect(mailboxes).to.not.be.empty;

                    done();
                });
            });
        });

        describe('#listMessages', function() {
            it('should succeed', function(done) {
                imap.selectMailbox("inbox", function(err){
                    expect(err).to.not.exist;
                    imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure", "body.peek[]"], function(err, messages) {
                        expect(err).to.not.exist;
                        expect(messages).to.not.be.empty;
                        done();
                    });
                });
            });
        });

        describe('#search', function() {
            it('should return a sequence number', function(done) {
                imap.selectMailbox('inbox', function(err){
                    expect(err).to.not.exist;
                    imap.search({header: ['subject', 'hello 3']}, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([3]);
                        done();
                    });
                });
            });

            it('should return an uid', function(done) {
                imap.selectMailbox('inbox', function(err){
                    expect(err).to.not.exist;
                    imap.search({header: ['subject', 'hello 3']}, {byUid: true}, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([555]);
                        done();
                    });
                });
            });

            it('should work with complex queries', function(done) {
                imap.selectMailbox('inbox', function(err){
                    expect(err).to.not.exist;
                    imap.search({header: ['subject', 'hello'], seen: true}, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([2]);
                        done();
                    });
                });
            });
        });
    });
});