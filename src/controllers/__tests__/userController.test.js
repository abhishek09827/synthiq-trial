// userController.test.js
import UserController from './userController'; // Adjust import as necessary
import { supabase } from '../config/supabaseClient.js';
import clerk from '../config/clerkClient.js';

// Mock the supabase and clerk functions
jest.mock('../config/supabaseClient.js');
jest.mock('../config/clerkClient.js');

describe('UserController', () => {
    const mockRequest = (auth = {}) => ({
        body: {},
        auth: { publicMetadata: auth },
        params: {},
        file: null,
    });

    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    test('should add user successfully (Super Admin)', async () => {
        const req = mockRequest({ role: 'Super Admin' });
        const res = mockResponse();
        req.body = { email: 'test@example.com', fullName: 'John Doe', role: 'User', bearerToken: 'token' };

        clerk.users.createUser.mockResolvedValue({ id: 'new-user-id' });
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ id: 'new-user-id' }) }),
        });

        await UserController.addUser(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User added successfully',
            user: { id: 'new-user-id' },
        });
    });

    test('should return 403 if not Super Admin when adding user', async () => {
        const req = mockRequest({ role: 'User' });
        const res = mockResponse();
        req.body = { email: 'test@example.com', fullName: 'John Doe', role: 'User' };

        await UserController.addUser(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied' });
    });

    test('should get users successfully (Super Admin)', async () => {
        const req = mockRequest({ role: 'Super Admin' });
        const res = mockResponse();

        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [{ id: 'user-id', email: 'test@example.com' }], error: null }),
        });

        await UserController.getUsers(req, res);
        expect(res.json).toHaveBeenCalledWith([{ id: 'user-id', email: 'test@example.com' }]);
    });

    test('should return users only for AgencyOwner', async () => {
        const req = mockRequest({ role: 'Agency Owner', agencyId: 'agency-id' });
        const res = mockResponse();

        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [{ id: 'user-id', email: 'test@example.com', agency_id: 'agency-id' }], error: null }),
        });

        await UserController.getUsers(req, res);
        expect(res.json).toHaveBeenCalledWith([{ id: 'user-id', email: 'test@example.com', agency_id: 'agency-id' }]);
    });

    test('should delete user successfully (Admin)', async () => {
        const req = mockRequest({ role: 'Admin' });
        const res = mockResponse();
        req.params.id = 'user-id';

        supabase.from.mockReturnValue({
            delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
        });

        await UserController.deleteUser(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    test('should return 403 if not Admin when deleting user', async () => {
        const req = mockRequest({ role: 'User' });
        const res = mockResponse();
        req.params.id = 'user-id';

        await UserController.deleteUser(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied' });
    });
});
